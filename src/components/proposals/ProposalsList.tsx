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

type Status = 'interested' | 'mutual' | 'passed'
type LiveProposal = Proposal & { state: 'none' | Status }

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

  const record = async (p: Proposal, kind: 'interested' | 'passed') => {
    const before = status[p.id]
    setStatus((s) => ({ ...s, [p.id]: kind }))
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/candidate/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ to: p.id, kind }),
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
          {he ? 'כשיצטרפו עוד מועמדים מתאימים, ההצעות יופיעו כאן.' : 'Suggestions will appear here as more candidates join.'}
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

            {!st && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => record(p, 'interested')}
                  className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm transition-colors"
                >
                  {he ? 'מעוניין/ת' : 'Interested'}
                </button>
                <button
                  onClick={() => record(p, 'passed')}
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
