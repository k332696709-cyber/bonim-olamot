'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProposalDetailModal } from '@/components/smart-match/ProposalDetailModal'
import { DateIdeasModal } from '@/components/smart-match/DateIdeasModal'
import {
  MALE_STYLE_OPTIONS, FEMALE_STYLE_OPTIONS, TRAIT_OPTIONS_MALE, TRAIT_OPTIONS_FEMALE,
} from '@/constants/formOptions'
import { applyPrefs, describePrefs, isMale, type AnyProfile, type Prefs, type Proposal } from '@/lib/matchmaking/assistant'
import { loadPrefs, savePrefs } from '@/lib/matchmaking/prefsStore'
import { PASS_REASONS } from '@/constants/passReasons'

type Status = 'interested' | 'mutual' | 'passed'
type LiveProposal = Proposal & { state: 'none' | Status; busy?: boolean }

const label = (opts: { value: string; he: string; en: string }[], v: string, he: boolean) => {
  const o = opts.find((x) => x.value === v)
  return o ? (he ? o.he : o.en) : v
}

/**
 * The candidate's suggestions, shown right in the personal area. The smart assistant only refines
 * them (its filters are kept in the browser and applied here).
 */
export function ProposalsList({ locale, me }: { locale: string; me: AnyProfile }) {
  const he = locale === 'he'
  const [prefs, setPrefs] = useState<Prefs>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [all, setAll] = useState<LiveProposal[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [datesId, setDatesId] = useState<string | null>(null)
  const [passFor, setPassFor] = useState<Proposal | null>(null)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [learned, setLearned] = useState<string[]>([])
  const [interestedInMe, setInterestedInMe] = useState(0)
  const [meBusy, setMeBusy] = useState(false)

  useEffect(() => { setPrefs(loadPrefs()) }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch('/api/candidate/proposals', { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        if (!res.ok) throw new Error('bad')
        const json = await res.json()
        if (!alive) return
        const list: LiveProposal[] = json.proposals ?? []
        setAll(list)
        setLearned(json.learned ?? [])
        setInterestedInMe(json.interestedInMe ?? 0)
        setMeBusy(!!json.meBusy)
        const st: Record<string, Status> = {}
        for (const p of list) if (p.state !== 'none') st[p.id] = p.state
        setStatus(st)
      } catch {
        if (alive) setLoadError(true)
      }
    })()
    return () => { alive = false }
  }, [])

  const list = all ?? []
  const shown = useMemo(() => applyPrefs(list, prefs, me), [list, prefs, me])
  const visible = shown.filter((p) => status[p.id] !== 'passed')
  const waiting = visible.filter((p) => !status[p.id]).length

  const record = async (p: Proposal, kind: 'interested' | 'passed', why?: { reason: string; note: string }) => {
    const before = status[p.id]
    setStatus((s) => ({ ...s, [p.id]: kind }))
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/candidate/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ to: p.id, kind, ...(why ?? {}) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error('bad')
      setStatus((s) => ({ ...s, [p.id]: json.state }))
    } catch {
      setStatus((s) => {
        const next = { ...s }
        if (before) next[p.id] = before
        else delete next[p.id]
        return next
      })
    }
  }

  const styleOpts = isMale(me) ? FEMALE_STYLE_OPTIONS : MALE_STYLE_OPTIONS
  const traitOpts = isMale(me) ? TRAIT_OPTIONS_FEMALE : TRAIT_OPTIONS_MALE
  const filterText = describePrefs(prefs, he)

  return (
    <section id="proposals" className="flex flex-col gap-5 scroll-mt-24">
      {openId && <ProposalDetailModal id={openId} he={he} onClose={() => setOpenId(null)} />}
      {datesId && <DateIdeasModal id={datesId} he={he} onClose={() => setDatesId(null)} />}
      {passFor && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setPassFor(null)} dir={he ? 'rtl' : 'ltr'}>
          <div role="dialog" aria-modal="true" className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-luxury p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-navy-800">{he ? 'למה זה לא מתאים?' : 'Why is this not a fit?'}</h3>
            <p className="text-sm text-navy-500">
              {he ? 'חובה לבחור סיבה. כך העוזר החכם ילמד להציע לך הצעות מתאימות יותר. הסיבה לא נחשפת לצד השני.' : 'Please choose a reason. It helps the assistant suggest better matches. It is not shown to the other side.'}
            </p>
            <div className="flex flex-col gap-2" role="radiogroup">
              {PASS_REASONS.map((r) => (
                <button
                  key={r.code} type="button" role="radio" aria-checked={reason === r.code}
                  onClick={() => setReason(r.code)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm text-start ${reason === r.code ? 'border-navy-800 bg-navy-50 font-semibold' : 'border-navy-100 hover:border-navy-300'}`}
                >
                  <span className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${reason === r.code ? 'border-navy-800 bg-navy-800 text-white text-xs' : 'border-navy-300'}`}>{reason === r.code ? '✓' : ''}</span>
                  {he ? r.he : r.en}
                </button>
              ))}
            </div>
            {reason && (
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2}
                placeholder={reason === 'other' ? (he ? 'כתבו למה (חובה)' : 'Explain why (required)') : (he ? 'אפשר להוסיף פרטים (לא חובה)' : 'Add details (optional)')}
                className="rounded-2xl border border-navy-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={!reason || (reason === 'other' && note.trim().length < 2)}
                onClick={() => { const p = passFor; setPassFor(null); if (p) record(p, 'passed', { reason, note: note.trim() }) }}
                className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-40 text-white font-bold text-sm"
              >
                {he ? 'שליחה' : 'Send'}
              </button>
              <button type="button" onClick={() => setPassFor(null)} className="h-12 px-6 rounded-full border border-navy-200 text-navy-600 hover:bg-navy-50 text-sm font-medium">
                {he ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[32px] bg-navy-800 text-white shadow-luxury px-6 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest text-burgundy-300 mb-1">{he ? 'ההצעות שלי' : 'MY SUGGESTIONS'}</p>
          <h2 className="text-2xl font-bold">
            {all === null && !loadError
              ? (he ? 'מחפשים הצעות...' : 'Looking for suggestions…')
              : visible.length === 0
                ? (he ? 'עדיין אין הצעות' : 'No suggestions yet')
                : he
                  ? `יש לך ${visible.length} ${visible.length === 1 ? 'הצעה' : 'הצעות'}`
                  : `You have ${visible.length} suggestion${visible.length === 1 ? '' : 's'}`}
          </h2>
          {visible.length > 0 && (
            <p className="text-sm text-navy-100 mt-1">
              {waiting > 0
                ? (he ? `${waiting} ממתינות לתשובה שלך.` : `${waiting} waiting for your answer.`)
                : (he ? 'ענית על כל ההצעות. כשיגיעו חדשות נעדכן אותך.' : 'You answered all of them. We will tell you when new ones arrive.')}
            </p>
          )}
        </div>
        <Link
          href={`/${locale}/smart-match`}
          className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/25 text-white text-sm font-semibold inline-flex items-center justify-center"
        >
          {he ? '✦ דיוק עם העוזר החכם' : '✦ Refine with the assistant'}
        </Link>
      </div>

      {interestedInMe > 0 && (
        <div className="rounded-2xl bg-burgundy-500 text-white px-5 py-4 text-sm font-semibold">
          {he
            ? (interestedInMe === 1 ? 'יש מי שמתעניין/ת בך! עברו על ההצעות, ואם גם אתם מעוניינים, לחצו "מעוניין/ת".' : `יש ${interestedInMe} מתעניינים בך! עברו על ההצעות, ואם גם אתם מעוניינים, לחצו "מעוניין/ת".`)
            : (interestedInMe === 1 ? 'Someone is interested in you! Go through the suggestions and press "Interested" if you are too.' : `${interestedInMe} people are interested in you! Go through the suggestions and press "Interested" if you are too.`)}
        </div>
      )}

      {learned.length > 0 && (
        <p className="text-sm text-navy-600 bg-white rounded-2xl shadow-sm px-4 py-3">
          <span className="font-semibold">{he ? 'העוזר התאים את ההצעות לפי מה שענית: ' : 'The assistant adjusted your suggestions: '}</span>
          {learned.join(' · ')}
        </p>
      )}

      {filterText && (
        <div className="flex items-center gap-2 flex-wrap text-sm text-navy-600">
          <span className="rounded-full bg-white shadow-sm px-4 py-1.5">
            {he ? 'סינון מהעוזר: ' : 'Assistant filter: '}{filterText}
          </span>
          <button
            type="button" onClick={() => { savePrefs({}); setPrefs({}) }}
            className="rounded-full border border-navy-200 px-4 py-1.5 hover:bg-navy-50"
          >
            {he ? 'ניקוי סינון' : 'Clear filter'}
          </button>
        </div>
      )}

      <p className="text-xs text-navy-500 bg-white rounded-full px-4 py-2 self-start shadow-sm">
        {he
          ? 'בכרטיס המלא אפשר לראות תמונות ורזומה. טלפון ומייל אינם נחשפים, ומספרים לבירורים נחשפים רק אחרי עניין הדדי.'
          : 'The full card shows photos and a resume. Phone and email are never shown, and inquiry contacts appear only after mutual interest.'}
      </p>

      {loadError && (
        <div className="rounded-[28px] bg-white p-8 text-center text-navy-500 shadow-card">
          {he ? 'לא הצלחנו לטעון הצעות. נסו לרענן את העמוד.' : 'We could not load suggestions. Please refresh.'}
        </div>
      )}
      {all !== null && all.length === 0 && (
        <div className="rounded-[28px] bg-white p-8 text-center text-navy-500 shadow-card">
          {he ? 'כרגע אין התאמה של 88% ומעלה. כשתהיה התאמה גבוהה באמת, נעדכן אותך והיא תופיע כאן.' : 'There is no 88%+ match right now. When a truly high match appears, we will tell you and it will show here.'}
        </div>
      )}
      {all !== null && all.length > 0 && shown.length === 0 && (
        <div className="rounded-[28px] bg-white p-8 text-center text-navy-500 shadow-card">
          {he ? 'אין הצעות שמתאימות לסינון הזה. אפשר לנקות אותו.' : 'No suggestions match this filter. You can clear it.'}
        </div>
      )}

      {visible.map((p) => {
        const st = status[p.id]
        const reasons = he ? p.highlightsHe : p.highlightsEn
        const watch = he ? p.conflictsHe : p.conflictsEn
        return (
          <article key={p.id} className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-light">
                {p.initial}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-navy-800">
                  {p.name || `${p.initial}.`} · {he ? `${p.gender === 'female' ? 'בת' : 'בן'} ${p.age}` : `Age ${p.age}`}
                </p>
                <p className="text-sm text-navy-500">{p.city} · {p.community}</p>
                <p className="text-sm text-navy-500">{p.occupation} · {label(styleOpts, p.style, he)}</p>
                <p className={`mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${p.busy ? 'bg-burgundy-50 text-burgundy-600' : 'bg-navy-50 text-navy-500'}`}>
                  {p.busy
                    ? (he ? (p.gender === 'female' ? 'מיועדת באמצע תהליך' : 'מיועד באמצע תהליך') : 'In the middle of a process')
                    : (he ? (p.gender === 'female' ? 'פנויה' : 'פנוי') : 'Available')}
                </p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-3xl font-light text-burgundy-500 tabular-nums" dir="ltr">{p.score}%</p>
                <p className="text-[11px] text-navy-400">{he ? 'התאמה' : 'match'}</p>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-[#f1f1f1] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-l from-burgundy-400 to-burgundy-500" style={{ width: `${p.score}%` }} />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {p.traits.map((tr) => (
                <span key={tr} className="rounded-full bg-navy-50 text-navy-600 text-xs px-3 py-1">{label(traitOpts, tr, he)}</span>
              ))}
            </div>

            {reasons.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-navy-400 mb-1.5">{he ? 'למה זה מתאים' : 'WHY IT FITS'}</p>
                <ul className="flex flex-col gap-1">
                  {reasons.map((r) => (
                    <li key={r} className="text-sm text-navy-700 flex gap-2"><span className="text-burgundy-500">✓</span>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {watch.length > 0 && (
              <div className="rounded-2xl bg-[#f1f1f1] px-4 py-3">
                <p className="text-xs font-semibold text-navy-400 mb-1">{he ? 'שווה לברר' : 'WORTH CHECKING'}</p>
                {watch.map((w) => <p key={w} className="text-sm text-navy-600">• {w}</p>)}
              </div>
            )}

            <button
              type="button" onClick={() => setOpenId(p.id)}
              className="self-start h-11 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold"
            >
              {he ? 'לכרטיס המלא ולתמונות' : 'Full card and photos'}
            </button>

            {!st && (p.busy || meBusy) && (
              <p className="rounded-full bg-[#f1f1f1] text-navy-500 text-sm px-5 py-3 text-center">
                {meBusy
                  ? (he ? 'את/ה באמצע תהליך שידוך, ולכן אי אפשר לסמן עניין כרגע.' : 'You are in the middle of a match, so you cannot show interest right now.')
                  : (he ? (p.gender === 'female' ? 'המיועדת באמצע תהליך, ולכן אי אפשר לסמן עניין כרגע.' : 'המיועד באמצע תהליך, ולכן אי אפשר לסמן עניין כרגע.') : 'This person is in the middle of a process, so interest cannot be sent right now.')}
              </p>
            )}
            {!st && !p.busy && !meBusy && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => record(p, 'interested')}
                  className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm transition-colors"
                >
                  {he ? 'מעוניין/ת' : 'Interested'}
                </button>
                <button
                  onClick={() => { setPassFor(p); setReason(''); setNote('') }}
                  className="h-12 px-6 rounded-full border border-navy-200 text-navy-600 hover:bg-navy-50 text-sm font-medium transition-colors"
                >
                  {he ? 'לא כרגע' : 'Not now'}
                </button>
              </div>
            )}
            {st === 'interested' && (
              <p className="rounded-full bg-navy-50 text-navy-700 text-sm px-5 py-3 text-center">
                {he ? '✓ העניין שלך נשלח בדיסקרטיות. ממתינים לצד השני.' : '✓ Your interest was sent discreetly. Waiting for the other side.'}
              </p>
            )}
            {st === 'mutual' && (
              <div className="rounded-3xl bg-navy-800 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="flex-1 text-sm">
                  {he ? 'יש עניין הדדי! שדכנית תיכנס לתמונה ותיצור איתך קשר.' : 'Mutual interest! A matchmaker will step in and contact you.'}
                </p>
                <button
                  type="button" onClick={() => setDatesId(p.id)}
                  className="h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/25 text-white font-bold text-sm"
                >
                  {he ? 'מקומות לדייט' : 'Date places'}
                </button>
                <Link
                  href={`/${locale}/contact`}
                  className="h-11 px-6 rounded-full bg-burgundy-400 hover:bg-burgundy-300 text-white font-bold text-sm inline-flex items-center justify-center"
                >
                  {he ? 'לדבר עם שדכנית' : 'Talk to a matchmaker'}
                </Link>
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}
