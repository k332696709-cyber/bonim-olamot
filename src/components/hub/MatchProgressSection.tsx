'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchProgress, MatchStage } from '@/types/hub'
import { MATCH_STAGES } from '@/types/hub'

const STAGE_LABELS_HE: Record<MatchStage, string> = {
  checking: 'בירורים',
  proposal_sent: 'הצעה נשלחה',
  meeting_1: 'פגישה 1',
  meeting_2: 'פגישה 2',
  more_meetings: 'עוד פגישות',
  closing: 'סגירת ווארט',
}

const STAGE_LABELS_EN: Record<MatchStage, string> = {
  checking: 'Checking',
  proposal_sent: 'Proposal Sent',
  meeting_1: 'Meeting 1',
  meeting_2: 'Meeting 2',
  more_meetings: 'More meetings',
  closing: 'Engagement',
}

const STAGE_TRACK_COLOR: Record<MatchStage, string> = {
  checking: 'bg-gray-400',
  proposal_sent: 'bg-blue-400',
  meeting_1: 'bg-orange-400',
  meeting_2: 'bg-navy-500',
  more_meetings: 'bg-purple-500',
  closing: 'bg-green-500',
}

const STAGE_BADGE: Record<MatchStage, string> = {
  checking:      'bg-[#f1f1f1]  border-gray-200  text-gray-600',
  proposal_sent: 'bg-blue-50  border-blue-200  text-blue-700',
  meeting_1:     'bg-orange-50 border-orange-200 text-orange-700',
  meeting_2:     'bg-navy-50  border-navy-200  text-navy-700',
  more_meetings: 'bg-purple-50 border-purple-200 text-purple-700',
  closing:       'bg-green-50 border-green-200 text-green-700',
}

function ProgressBar({ stage, locale }: { stage: MatchStage; locale: string }) {
  const isHe = locale === 'he'
  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const currentIdx = MATCH_STAGES.indexOf(stage)
  const trackColor = STAGE_TRACK_COLOR[stage]

  return (
    <div className="flex w-full gap-0.5 mt-1" dir={isHe ? 'rtl' : 'ltr'}>
      {MATCH_STAGES.map((s, i) => {
        const filled = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={s} className="flex flex-col items-center flex-1 gap-1">
            <div
              className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                filled ? trackColor : 'bg-gray-200'
              }`}
            />
            <span
              className={`text-[9px] font-medium leading-tight text-center ${
                isCurrent ? 'text-navy-600 font-bold' : filled ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              {labels[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const FEE_MIN = 5000
const FEE_MAX = 10000

async function sendFee(payload: Record<string, unknown>): Promise<{ ok: boolean; message?: string; match?: any; emailed?: number }> {
  try {
    const { data } = await createClient().auth.getSession()
    const res = await fetch('/api/matchmaker/match-fee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    return res.ok ? { ok: true, match: json.match, emailed: json.emailed } : { ok: false, message: json.message }
  } catch {
    return { ok: false, message: 'השליחה נכשלה. בדקו את החיבור ונסו שוב.' }
  }
}

/** Amount field + send button. The amount goes to both candidates (email and personal area). */
function FeeEditor({
  isHe, initial, label, onSend,
}: {
  isHe: boolean
  initial?: number | null
  label: string
  onSend: (amount: number) => Promise<string | null>
}) {
  const [value, setValue] = useState(initial ? String(initial) : '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr(''); setMsg('')
    const n = Number(value.replace(/[^0-9]/g, ''))
    if (!Number.isInteger(n) || n < FEE_MIN || n > FEE_MAX) {
      setErr(isHe ? `הסכום חייב להיות בין ${FEE_MIN.toLocaleString('he-IL')} ל-${FEE_MAX.toLocaleString('he-IL')} ש"ח` : `Amount must be between ${FEE_MIN} and ${FEE_MAX} NIS`)
      return
    }
    setBusy(true)
    const problem = await onSend(n)
    setBusy(false)
    if (problem) setErr(problem)
    else setMsg(isHe ? 'נשלח למיועד ולמיועדת.' : 'Sent to both candidates.')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isHe ? 'סכום בש"ח' : 'Amount, NIS'}
          aria-label={isHe ? 'סכום דמי שידוך' : 'Matchmaking fee amount'}
          className="h-9 w-32 rounded-lg border border-gray-200 bg-[#f1f1f1] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-9 px-4 rounded-lg bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-xs font-bold"
        >
          {busy ? (isHe ? 'שולח...' : 'Sending…') : label}
        </button>
      </div>
      {err && <p className="text-xs text-burgundy-500" role="alert">{err}</p>}
      {msg && <p className="text-xs text-green-700" role="status">{msg}</p>}
    </div>
  )
}

interface Colleague { id: string; name: string; isMe: boolean }
let colleaguesCache: Colleague[] | null = null

async function loadColleagues(): Promise<Colleague[]> {
  if (colleaguesCache) return colleaguesCache
  try {
    const { data } = await createClient().auth.getSession()
    const res = await fetch('/api/matchmaker/team', { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
    if (!res.ok) return []
    const json = await res.json()
    colleaguesCache = (json.members ?? []).map((m: any) => ({ id: m.id, name: m.name, isMe: !!m.isMe }))
    return colleaguesCache ?? []
  } catch {
    return []
  }
}

async function setCollaborator(matchId: string, coMatchmakerId: string | null): Promise<{ ok: boolean; message?: string; co?: { id: string; name: string; email: string } | null }> {
  try {
    const { data } = await createClient().auth.getSession()
    const res = await fetch('/api/matchmaker/match-collab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
      body: JSON.stringify({ matchId, coMatchmakerId }),
    })
    const json = await res.json().catch(() => ({}))
    return res.ok ? { ok: true, co: json.co } : { ok: false, message: json.message }
  } catch {
    return { ok: false, message: 'השמירה נכשלה. בדקו את החיבור ונסו שוב.' }
  }
}

/** Optional: a second matchmaker can work on the same match. */
function Collaboration({
  match, isHe, isOwner, isAdmin, isCo, onChange,
}: {
  match: MatchProgress
  isHe: boolean
  isOwner: boolean
  isAdmin: boolean
  isCo: boolean
  onChange: (patch: Partial<MatchProgress>) => void
}) {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<Colleague[]>([])
  const [pick, setPick] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const openPicker = async () => {
    setOpen(true)
    setList(await loadColleagues())
  }
  const save = async (id: string | null) => {
    setBusy(true); setErr('')
    const r = await setCollaborator(match.id, id)
    setBusy(false)
    if (!r.ok) { setErr(r.message ?? (isHe ? 'השמירה נכשלה.' : 'Saving failed.')); return }
    onChange(id && r.co ? { coId: r.co.id, coName: r.co.name, coEmail: r.co.email } : { coId: null, coName: '', coEmail: '' })
    setOpen(false); setPick('')
  }

  const canAdd = isOwner || isAdmin
  const choices = list.filter((c) => !c.isMe && c.id !== match.matchmakerId)

  return (
    <div className="mt-3 border-t border-gray-100 pt-3 text-xs" dir={isHe ? 'rtl' : 'ltr'}>
      {match.coId ? (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-gray-500">
            {isHe ? 'שותף/ה לשידוך: ' : 'Working with: '}
            <span className="font-bold text-navy-700">{isCo ? (match.matchmakerName || (isHe ? 'השדכן/ית המטפל/ת' : 'the matchmaker')) : match.coName}</span>
          </p>
          {(isOwner || isAdmin || isCo) && (
            <button type="button" disabled={busy} onClick={() => save(null)}
              className="font-medium text-navy-600 hover:text-navy-800 border border-navy-200 rounded-lg px-3 py-1 hover:bg-navy-50 disabled:opacity-60">
              {isCo ? (isHe ? 'יציאה מהשידוך' : 'Leave this match') : (isHe ? 'הסרת השותף/ה' : 'Remove')}
            </button>
          )}
        </div>
      ) : canAdd ? (
        !open ? (
          <button type="button" onClick={openPicker} className="font-medium text-navy-600 hover:text-navy-800 underline">
            {isHe ? 'הוספת שדכן/ית נוסף/ת לשידוך' : 'Add another matchmaker'}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select value={pick} onChange={(e) => setPick(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-[#f1f1f1] px-3 text-xs" aria-label={isHe ? 'בחירת שדכן/ית' : 'Choose a matchmaker'}>
              <option value="">{isHe ? 'בחרו שדכן/ית...' : 'Choose…'}</option>
              {choices.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" disabled={!pick || busy} onClick={() => save(pick)}
              className="h-9 px-4 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white font-bold">
              {isHe ? 'הוספה' : 'Add'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-500 underline">{isHe ? 'ביטול' : 'Cancel'}</button>
          </div>
        )
      ) : null}
      {err && <p className="text-burgundy-500 mt-1" role="alert">{err}</p>}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  )
}

function MatchCard({
  match,
  locale,
  canEdit,
  onAdvance,
  onDrop,
  onMatchSaved,
  isAdmin,
  currentUserEmail,
}: {
  match: MatchProgress
  locale: string
  canEdit: boolean
  onAdvance: (id: string, next: MatchStage) => void
  onDrop: (id: string, dropped: boolean) => Promise<boolean>
  onMatchSaved: (m: any) => void
  isAdmin: boolean
  currentUserEmail: string
}) {
  const [editingFee, setEditingFee] = useState(false)
  const [dropBusy, setDropBusy] = useState(false)
  const [paidBusy, setPaidBusy] = useState(false)
  const [paidError, setPaidError] = useState('')
  const isHe = locale === 'he'
  const dropped = match.status === 'rejected'
  // Only the matchmaker who opened the match (or an admin) sets and sends the fee; a colleague added to it cannot.
  const canSetFee = isAdmin || match.matchmakerEmail === currentUserEmail
  // The matchmaker of the match, their colleague on it, or an admin confirms that the fee was received.
  const canConfirmPaid = isAdmin || match.matchmakerEmail === currentUserEmail || (!!match.coEmail && match.coEmail === currentUserEmail)
  const confirmPaid = async (paid: boolean) => {
    setPaidBusy(true)
    setPaidError('')
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/matchmaker/match-fee-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ matchId: match.id, paid }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      onMatchSaved({ id: match.id, patch: { feePaidAt: json.feePaidAt ?? null } })
    } catch (e) {
      setPaidError(e instanceof Error && e.message !== 'bad' ? e.message : (isHe ? 'השמירה נכשלה.' : 'Saving failed.'))
    } finally {
      setPaidBusy(false)
    }
  }
  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const currentIdx = MATCH_STAGES.indexOf(match.stage)
  const hasNext = currentIdx < MATCH_STAGES.length - 1
  const nextStage = hasNext ? MATCH_STAGES[currentIdx + 1] : null

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-shadow ${dropped ? 'bg-[#f5f5f5] border-gray-200 opacity-80' : 'bg-white border-gray-200 hover:shadow-md'}`}>
      <div className="flex items-start justify-between gap-2 mb-3" dir={isHe ? 'rtl' : 'ltr'}>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-700 flex-wrap">
            <span>{match.femaleName}</span>
            <span className="text-gray-300">×</span>
            <span>{match.maleName}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isHe ? 'שדכנ/ית:' : 'Matchmaker:'} {match.matchmakerName}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dropped ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-300 bg-white text-gray-600">
              <TrashIcon /> {isHe ? 'ההצעה ירדה' : 'Proposal came down'}
            </span>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STAGE_BADGE[match.stage]}`}>
              {labels[match.stage]}
            </span>
          )}
          {canEdit && !dropped && (
            <button
              type="button" disabled={dropBusy} title={isHe ? 'לא יתקדם: להוריד את ההצעה' : 'Will not go forward: take the proposal down'}
              aria-label={isHe ? 'לא יתקדם, להוריד את ההצעה' : 'Take the proposal down'}
              onClick={async () => {
                if (!window.confirm(isHe ? 'להוריד את ההצעה? השידוך לא יתקדם, וההצעה תסומן "ההצעה ירדה".' : 'Take this proposal down? The match will not go forward.')) return
                setDropBusy(true); await onDrop(match.id, true); setDropBusy(false)
              }}
              className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-burgundy-600 hover:border-burgundy-300 flex items-center justify-center disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>

      <ProgressBar stage={match.stage} locale={locale} />

      {dropped && (
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap" dir={isHe ? 'rtl' : 'ltr'}>
          <p className="text-xs text-gray-500">
            {isHe ? `ההצעה ירדה בשלב: ${labels[match.stage]}` : `The proposal came down at: ${labels[match.stage]}`}
          </p>
          {canEdit && (
            <button type="button" disabled={dropBusy}
              onClick={async () => { setDropBusy(true); await onDrop(match.id, false); setDropBusy(false) }}
              className="text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200 rounded-lg px-3 py-1 hover:bg-navy-50 disabled:opacity-50">
              {isHe ? 'החזרת ההצעה' : 'Put it back'}
            </button>
          )}
        </div>
      )}

      {/* Matchmaking fee */}
      {!dropped && (
      <div className="mt-3 border-t border-gray-100 pt-3" dir={isHe ? 'rtl' : 'ltr'}>
        {match.feeAmount && !editingFee ? (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-xs text-gray-500">
                {isHe ? 'דמי שידוך שנשלחו: ' : 'Fee sent: '}
                <span className="font-bold text-navy-700 tabular-nums">{match.feeAmount.toLocaleString(isHe ? 'he-IL' : 'en-GB')} {isHe ? 'ש"ח' : 'NIS'}</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isHe ? 'אישור קריאה: ' : 'Confirmed: '}
                <span className={match.femaleAck ? 'text-green-700 font-semibold' : ''}>{isHe ? 'מיועדת' : 'woman'} {match.femaleAck ? '✓' : '—'}</span>
                {' · '}
                <span className={match.maleAck ? 'text-green-700 font-semibold' : ''}>{isHe ? 'מיועד' : 'man'} {match.maleAck ? '✓' : '—'}</span>
              </p>
            </div>
            {canSetFee && (
              <button type="button" onClick={() => setEditingFee(true)}
                className="text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200 rounded-lg px-3 py-1 hover:bg-navy-50">
                {isHe ? 'עדכון סכום' : 'Change amount'}
              </button>
            )}
          </div>
        ) : canSetFee ? (
          <FeeEditor
            isHe={isHe}
            initial={match.feeAmount}
            label={match.feeAmount ? (isHe ? 'שליחת הסכום החדש' : 'Send new amount') : (isHe ? 'שליחת דמי שידוך' : 'Send matchmaking fee')}
            onSend={async (amount) => {
              const r = await sendFee({ matchId: match.id, amount })
              if (!r.ok) return r.message ?? (isHe ? 'השליחה נכשלה.' : 'Sending failed.')
              onMatchSaved(r.match)
              setEditingFee(false)
              return null
            }}
          />
        ) : (
          <p className="text-xs text-gray-400">{isHe ? 'דמי השידוך נקבעים ונשלחים על ידי השדכן/ית שפתח/ה את השידוך' : 'The fee is set and sent by the matchmaker who opened the match'}</p>
        )}
      </div>
      )}

      {!dropped && match.stage === 'closing' && match.feeAmount && (
        <div className="mt-3 border-t border-gray-100 pt-3 flex items-center justify-between gap-2 flex-wrap" dir={isHe ? 'rtl' : 'ltr'}>
          <p className={`text-xs font-semibold ${match.feePaidAt ? 'text-green-700' : 'text-burgundy-600'}`}>
            {match.feePaidAt
              ? (isHe ? '✓ דמי השידוך התקבלו' : '✓ Fee received')
              : (isHe ? 'דמי השידוך עדיין לא אושרו כנתקבלו. עד אז המועמדים לא יכולים למחוק את החשבון.' : 'The fee is not confirmed yet. Until then the candidates cannot delete their accounts.')}
          </p>
          {canConfirmPaid && (
            <button type="button" disabled={paidBusy} onClick={() => confirmPaid(!match.feePaidAt)}
              className="text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200 rounded-lg px-3 py-1 hover:bg-navy-50 disabled:opacity-50">
              {match.feePaidAt ? (isHe ? 'ביטול האישור' : 'Undo') : (isHe ? 'אישרתי שקיבלתי את הכסף' : 'I confirm the money was received')}
            </button>
          )}
          {paidError && <p className="w-full text-xs text-burgundy-600" role="alert">{paidError}</p>}
        </div>
      )}

      {!dropped && (
      <Collaboration
        match={match}
        isHe={isHe}
        isAdmin={isAdmin}
        isOwner={match.matchmakerEmail === currentUserEmail}
        isCo={!!match.coEmail && match.coEmail === currentUserEmail}
        onChange={(patch) => onMatchSaved({ id: match.id, patch })}
      />
      )}

      {canEdit && !dropped && nextStage && (
        <button
          type="button"
          onClick={() => onAdvance(match.id, nextStage)}
          className="mt-3 text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200
            rounded-lg px-3 py-1 hover:bg-navy-50 transition-colors"
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {isHe ? `← קדם ל: ${labels[nextStage]}` : `→ Advance to: ${labels[nextStage]}`}
        </button>
      )}
    </div>
  )
}

interface MatchProgressSectionProps {
  matches: MatchProgress[]
  isAdmin: boolean
  currentUserEmail: string
  locale: string
  onStageUpdate: (matchId: string, newStage: MatchStage) => void
  onDrop: (matchId: string, dropped: boolean) => Promise<boolean>
  onMatchSaved: (m: any) => void
  people: { id: string; name: string; gender: 'female' | 'male' }[]
  /** Candidates in the middle of an active match: they cannot be chosen for a new one. */
  busyIds?: Set<string>
}

export function MatchProgressSection({
  matches,
  isAdmin,
  currentUserEmail,
  locale,
  onStageUpdate,
  onDrop,
  onMatchSaved,
  people,
  busyIds,
}: MatchProgressSectionProps) {
  const isHe = locale === 'he'
  const [opening, setOpening] = useState(false)
  const [femaleId, setFemaleId] = useState('')
  const [maleId, setMaleId] = useState('')
  // A match on the table can be touched only by the matchmaker handling it, the colleague added to it, and an administrator.
  const mine = isAdmin ? matches : matches.filter(m => m.matchmakerEmail === currentUserEmail || (!!m.coEmail && m.coEmail === currentUserEmail))
  // Matches that came down go to the end of the list and do not count as active.
  const visible = mine.filter((m) => m.status !== 'rejected')
  const cameDown = mine.filter((m) => m.status === 'rejected')

  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const stageCounts = MATCH_STAGES.reduce(
    (acc, s) => { acc[s] = visible.filter(m => m.stage === s).length; return acc },
    {} as Record<MatchStage, number>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-navy-600 flex items-center gap-2">
          <span>{isHe ? 'מעקב התקדמות שידוכים' : 'Match Progress Tracker'}</span>
        </h2>
        <span className="text-xs text-gray-400">
          {isHe ? `${visible.length} שידוכים פעילים` : `${visible.length} active matches`}
        </span>
      </div>

      <div className="mb-4">
        {!opening ? (
          <button type="button" onClick={() => setOpening(true)}
            className="h-10 px-5 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold">
            {isHe ? 'פתיחת שידוך חדש' : 'Open a new match'}
          </button>
        ) : (
          <div className="rounded-2xl bg-[#f1f1f1] p-4 flex flex-col gap-3">
            <p className="text-sm font-bold text-navy-700">{isHe ? 'שידוך חדש ושליחת דמי השידוך' : 'New match and fee'}</p>
            <p className="text-xs text-gray-500">
              {isHe
                ? 'בחרו מיועדת ומיועד והזינו את הסכום שאתם לוקחים. הסכום נשלח לשניהם במייל ובאזור האישי, והם מאשרים שקראו. הסכום משולם רק לאחר סגירת האירוסין.'
                : 'Pick a woman and a man and enter your fee. It is sent to both by email and in their personal area, and they confirm they read it. It is paid only after the engagement.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={femaleId} onChange={(e) => setFemaleId(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" aria-label={isHe ? 'מיועדת' : 'Woman'}>
                <option value="">{isHe ? 'מיועדת...' : 'Woman…'}</option>
                {people.filter((x) => x.gender === 'female').map((x) => <option key={x.id} value={x.id} disabled={busyIds?.has(x.id)}>{x.name}{busyIds?.has(x.id) ? (isHe ? ' (באמצע שידוך)' : ' (in a match)') : ''}</option>)}
              </select>
              <select value={maleId} onChange={(e) => setMaleId(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" aria-label={isHe ? 'מיועד' : 'Man'}>
                <option value="">{isHe ? 'מיועד...' : 'Man…'}</option>
                {people.filter((x) => x.gender === 'male').map((x) => <option key={x.id} value={x.id} disabled={busyIds?.has(x.id)}>{x.name}{busyIds?.has(x.id) ? (isHe ? ' (באמצע שידוך)' : ' (in a match)') : ''}</option>)}
              </select>
            </div>
            <FeeEditor
              isHe={isHe}
              label={isHe ? 'פתיחת שידוך ושליחת הסכום' : 'Open match and send fee'}
              onSend={async (amount) => {
                if (!femaleId || !maleId) return isHe ? 'יש לבחור מיועדת ומיועד.' : 'Pick a woman and a man.'
                const r = await sendFee({ femaleId, maleId, amount })
                if (!r.ok) return r.message ?? (isHe ? 'השליחה נכשלה.' : 'Sending failed.')
                onMatchSaved(r.match)
                setFemaleId(''); setMaleId(''); setOpening(false)
                return null
              }}
            />
            <button type="button" onClick={() => setOpening(false)} className="self-start text-xs text-gray-500 underline">
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        )}
      </div>

      {/* Stage summary pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MATCH_STAGES.map(s => (
          <div
            key={s}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-opacity ${
              stageCounts[s] > 0 ? 'opacity-100' : 'opacity-40'
            } bg-[#f1f1f1] border-gray-200`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${STAGE_TRACK_COLOR[s]}`} />
            <span className="text-gray-600 font-medium">{labels[s]}</span>
            <span className="font-bold text-navy-700">{stageCounts[s]}</span>
          </div>
        ))}
      </div>

      {mine.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          {isHe ? 'אין שידוכים פעילים' : 'No active matches'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...visible, ...cameDown].map(match => (
            <MatchCard
              key={match.id}
              match={match}
              locale={locale}
              canEdit={isAdmin || match.matchmakerEmail === currentUserEmail || (!!match.coEmail && match.coEmail === currentUserEmail)}
              isAdmin={isAdmin}
              currentUserEmail={currentUserEmail}
              onAdvance={onStageUpdate}
              onDrop={onDrop}
              onMatchSaved={onMatchSaved}
            />
          ))}
        </div>
      )}
    </div>
  )
}
