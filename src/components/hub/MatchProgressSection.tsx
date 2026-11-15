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

function MatchCard({
  match,
  locale,
  canEdit,
  onAdvance,
  onMatchSaved,
}: {
  match: MatchProgress
  locale: string
  canEdit: boolean
  onAdvance: (id: string, next: MatchStage) => void
  onMatchSaved: (m: any) => void
}) {
  const [editingFee, setEditingFee] = useState(false)
  const isHe = locale === 'he'
  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const currentIdx = MATCH_STAGES.indexOf(match.stage)
  const hasNext = currentIdx < MATCH_STAGES.length - 1
  const nextStage = hasNext ? MATCH_STAGES[currentIdx + 1] : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
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
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STAGE_BADGE[match.stage]}`}>
          {labels[match.stage]}
        </span>
      </div>

      <ProgressBar stage={match.stage} locale={locale} />

      {/* Matchmaking fee */}
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
            {canEdit && (
              <button type="button" onClick={() => setEditingFee(true)}
                className="text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200 rounded-lg px-3 py-1 hover:bg-navy-50">
                {isHe ? 'עדכון סכום' : 'Change amount'}
              </button>
            )}
          </div>
        ) : canEdit ? (
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
          <p className="text-xs text-gray-400">{isHe ? 'דמי שידוך עוד לא נשלחו' : 'Fee not sent yet'}</p>
        )}
      </div>

      {canEdit && nextStage && (
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
  onMatchSaved: (m: any) => void
  people: { id: string; name: string; gender: 'female' | 'male' }[]
}

export function MatchProgressSection({
  matches,
  isAdmin,
  currentUserEmail,
  locale,
  onStageUpdate,
  onMatchSaved,
  people,
}: MatchProgressSectionProps) {
  const isHe = locale === 'he'
  const [opening, setOpening] = useState(false)
  const [femaleId, setFemaleId] = useState('')
  const [maleId, setMaleId] = useState('')
  const visible = isAdmin ? matches : matches.filter(m => m.matchmakerEmail === currentUserEmail)

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
                {people.filter((x) => x.gender === 'female').map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
              <select value={maleId} onChange={(e) => setMaleId(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" aria-label={isHe ? 'מיועד' : 'Man'}>
                <option value="">{isHe ? 'מיועד...' : 'Man…'}</option>
                {people.filter((x) => x.gender === 'male').map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
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

      {visible.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          {isHe ? 'אין שידוכים פעילים' : 'No active matches'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              locale={locale}
              canEdit={isAdmin || match.matchmakerEmail === currentUserEmail}
              onAdvance={onStageUpdate}
              onMatchSaved={onMatchSaved}
            />
          ))}
        </div>
      )}
    </div>
  )
}
