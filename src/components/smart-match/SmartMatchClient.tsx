'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import { loadCandidate, type CandidateState } from '@/lib/auth/candidate'
import {
  MALE_STYLE_OPTIONS, FEMALE_STYLE_OPTIONS, TRAIT_OPTIONS_MALE, TRAIT_OPTIONS_FEMALE,
} from '@/constants/formOptions'
import {
  applyPrefs, buildProposals, describePrefs, isMale,
  type AnyProfile, type Prefs, type Proposal,
} from '@/lib/matchmaking/assistant'

type Status = 'interested' | 'mutual' | 'passed'
interface Turn { role: 'user' | 'assistant'; text: string }

const ALL_PROFILES: AnyProfile[] = [...MOCK_MALE_PROFILES, ...MOCK_FEMALE_PROFILES]

const label = (opts: { value: string; he: string; en: string }[], v: string, he: boolean) => {
  const o = opts.find((x) => x.value === v)
  return o ? (he ? o.he : o.en) : v
}

/**
 * The Smart Assistant is only for approved candidates. A signed-in candidate whose registration
 * the administrator approved sees proposals; men are shown women's proposals and vice versa.
 */
export function SmartMatchClient({ locale }: { locale: string }) {
  const he = locale === 'he'
  const [cand, setCand] = useState<CandidateState | null>(null)

  useEffect(() => {
    let alive = true
    loadCandidate().then((c) => { if (alive) setCand(c) })
    return () => { alive = false }
  }, [])

  if (!cand) return <div className="min-h-[300px]" aria-busy="true" />

  if (cand.status !== 'approved' || !cand.profile) {
    const pending = cand.status === 'pending'
    return (
      <div className="max-w-xl mx-auto px-4 pb-24">
        <div className="rounded-[32px] bg-white shadow-card px-6 py-12 sm:px-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-2xl mb-5">{pending ? '' : ''}</div>
          <h2 className="text-2xl font-bold text-navy-800 mb-2">
            {pending
              ? (he ? 'ההרשמה שלך ממתינה לאישור' : 'Your registration is waiting for approval')
              : (he ? 'העוזר החכם נפתח אחרי הרשמה ואישור' : 'The Smart Assistant opens after registration and approval')}
          </h2>
          <p className="text-navy-500 mb-8">
            {pending
              ? (he ? 'אחרי שהמנהל יאשר את ההרשמה תוכלו לראות הצעות התאמה מדורגות ולדייק אותן עם העוזר.' : 'Once the administrator approves it you can see ranked match suggestions and refine them with the assistant.')
              : (he ? 'אחרי שתמלאו את שאלון ההכרות והמנהל יאשר, תוכלו לראות הצעות התאמה מדורגות ולדייק אותן עם העוזר.' : 'Once you complete the registration questionnaire and the administrator approves it, you can see ranked match suggestions and refine them with the assistant.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {pending ? (
              <Link href={`/${locale}/personal`}
                className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm inline-flex items-center justify-center transition-colors">
                {he ? 'לאזור האישי' : 'My area'}
              </Link>
            ) : (
              <>
                <Link href={`/${locale}/login`}
                  className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm inline-flex items-center justify-center transition-colors">
                  {he ? 'כניסה' : 'Sign in'}
                </Link>
                <Link href={`/${locale}/register/male`}
                  className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm inline-flex items-center justify-center transition-colors">
                  {he ? 'הרשמה למיועדים' : 'Register – men'}
                </Link>
                <Link href={`/${locale}/register/female`}
                  className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm inline-flex items-center justify-center transition-colors">
                  {he ? 'הרשמה למיועדות' : 'Register – women'}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <SmartMatchView locale={locale} me={cand.profile as AnyProfile} />
}

function SmartMatchView({ locale, me }: { locale: string; me: AnyProfile }) {
  const he = locale === 'he'
  const [prefs, setPrefs] = useState<Prefs>({})
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [chat, setChat] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const all = useMemo(() => buildProposals(me, ALL_PROFILES), [me])
  const cities = useMemo(() => Array.from(new Set(all.map((p) => p.city))), [all])
  const shown = useMemo(() => applyPrefs(all, prefs, me), [all, prefs, me])

  const welcome = he
    ? 'שלום! דירגתי עבורך הצעות לפי התאמה. אפשר לכתוב לי מה לשנות: עיר, טווח גילאים או סגנון.'
    : 'Hi! I ranked suggestions for you by compatibility. Tell me what to change: a city, an age range or a style.'

  const chips = he
    ? ['ירושלים', 'עד גיל 27', 'קצת יותר פתוח', 'נקה סינון']
    : ['Jerusalem', 'up to 27', 'a bit more open', 'clear filters']

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || busy) return
    setInput('')
    setBusy(true)
    const history = chat
    setChat((c) => [...c, { role: 'user', text: message }])
    try {
      const res = await fetch('/api/ai/match-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          locale: he ? 'he' : 'en',
          history,
          cities,
          current: prefs,
          me: { age: me.age, city: me.city, style: me.style },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('bad')
      setPrefs(data.prefs ?? {})
      setChat((c) => [...c, { role: 'assistant', text: data.reply }])
    } catch {
      setChat((c) => [
        ...c,
        { role: 'assistant', text: he ? 'משהו השתבש. נסו שוב בעוד רגע.' : 'Something went wrong. Please try again.' },
      ])
    } finally {
      setBusy(false)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }

  const express = (p: Proposal) => {
    setStatus((s) => ({ ...s, [p.id]: 'interested' }))
    // Demo only: a strong match answers "interested" back after a moment.
    if (p.score >= 70) {
      setTimeout(() => setStatus((s) => (s[p.id] === 'interested' ? { ...s, [p.id]: 'mutual' } : s)), 1800)
    }
  }

  const styleOpts = isMale(me) ? FEMALE_STYLE_OPTIONS : MALE_STYLE_OPTIONS
  const traitOpts = isMale(me) ? TRAIT_OPTIONS_FEMALE : TRAIT_OPTIONS_MALE
  const filterText = describePrefs(prefs, he)

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      <p className="mb-6 text-sm text-navy-500 text-center">
        {isMale(me)
          ? (he ? `שלום ${me.firstName}, אלו הצעות של מיועדות` : `Hi ${me.firstName}, here are suggestions of women`)
          : (he ? `שלום ${me.firstName}, אלו הצעות של מיועדים` : `Hi ${me.firstName}, here are suggestions of men`)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── Assistant ───────────────────────────────────────────── */}
        <aside className="lg:col-span-2 lg:sticky lg:top-24 rounded-[32px] bg-navy-800 text-[#f1f1f1] shadow-luxury overflow-hidden flex flex-col">
          <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
            <span className="w-11 h-11 rounded-full bg-burgundy-500 flex items-center justify-center text-lg">✦</span>
            <div className="leading-tight">
              <p className="font-bold">{he ? 'העוזר החכם' : 'Smart assistant'}</p>
              <p className="text-xs text-navy-200">
                {he ? 'מדייק את ההצעות לפי מה שחשוב לך' : 'Fine-tunes suggestions to what matters to you'}
              </p>
            </div>
          </div>

          <div className="px-5 py-5 flex flex-col gap-3 text-sm min-h-[260px] max-h-[380px] overflow-y-auto">
            <div className="self-start max-w-[88%] rounded-2xl rounded-ss-sm bg-white/10 px-4 py-2.5">{welcome}</div>
            {chat.map((t, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${
                  t.role === 'user'
                    ? 'self-end rounded-se-sm bg-burgundy-500 text-white'
                    : 'self-start rounded-ss-sm bg-white/10'
                }`}
              >
                {t.text}
              </div>
            ))}
            {busy && <div className="self-start text-xs text-navy-200 px-2">{he ? 'חושב...' : 'Thinking…'}</div>}
            <div ref={endRef} />
          </div>

          {filterText && (
            <div className="px-5 pb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                {filterText}
                <button
                  onClick={() => setPrefs({})}
                  className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 text-[10px]"
                  aria-label={he ? 'נקה סינון' : 'Clear filters'}
                >
                  ✕
                </button>
              </span>
            </div>
          )}

          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                disabled={busy}
                className="rounded-full border border-white/25 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            className="p-4 pt-1 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={he ? 'כתבו מה לדייק...' : 'Say what to refine…'}
              className="flex-1 h-12 rounded-full bg-white/10 border border-white/15 px-5 text-sm text-white
                placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-burgundy-300"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="h-12 px-6 rounded-full bg-burgundy-400 hover:bg-burgundy-300 text-white font-bold text-sm disabled:opacity-50"
            >
              {he ? 'שליחה' : 'Send'}
            </button>
          </form>
        </aside>

        {/* ── Proposals ───────────────────────────────────────────── */}
        <section className="lg:col-span-3 flex flex-col gap-5">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl text-navy-800">
              <span className="font-light">{he ? 'ההצעות ' : 'Your '}</span>
              <span className="font-bold">{he ? 'שלך' : 'suggestions'}</span>
            </h2>
            <span className="text-sm text-navy-400">
              {he ? `${shown.length} הצעות` : `${shown.length} suggestions`}
            </span>
          </div>

          <p className="text-xs text-navy-500 bg-white rounded-full px-4 py-2 self-start shadow-sm">
            {he
              ? 'מוצגים רק פרטים בסיסיים. שמות משפחה וטלפונים נחשפים רק אחרי עניין הדדי ואישור שדכנית.'
              : 'Only basic details are shown. Surnames and phone numbers are revealed only after mutual interest and matchmaker approval.'}
          </p>

          {shown.length === 0 && (
            <div className="rounded-[28px] bg-white p-10 text-center text-navy-500 shadow-card">
              {he ? 'אין הצעות שמתאימות לסינון הזה. נסו להרחיב אותו.' : 'No suggestions match these filters. Try widening them.'}
            </div>
          )}

          {shown.map((p) => {
            const st = status[p.id]
            if (st === 'passed') return null
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
                      {p.initial}. · {he ? `${p.gender === 'female' ? 'בת' : 'בן'} ${p.age}` : `Age ${p.age}`}
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
                    <span key={tr} className="rounded-full bg-navy-50 text-navy-600 text-xs px-3 py-1">
                      {label(traitOpts, tr, he)}
                    </span>
                  ))}
                </div>

                {reasons.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-navy-400 mb-1.5">
                      {he ? 'למה זה מתאים' : 'WHY IT FITS'}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {reasons.map((r) => (
                        <li key={r} className="text-sm text-navy-700 flex gap-2">
                          <span className="text-burgundy-500">✓</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {watch.length > 0 && (
                  <div className="rounded-2xl bg-[#f1f1f1] px-4 py-3">
                    <p className="text-xs font-semibold text-navy-400 mb-1">{he ? 'שווה לברר' : 'WORTH CHECKING'}</p>
                    {watch.map((w) => (
                      <p key={w} className="text-sm text-navy-600">• {w}</p>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {!st && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => express(p)}
                      className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm transition-colors"
                    >
                      {he ? 'מעוניין/ת' : 'Interested'}
                    </button>
                    <button
                      onClick={() => setStatus((s) => ({ ...s, [p.id]: 'passed' }))}
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
                      {he
                        ? 'יש עניין הדדי! שדכנית תיכנס לתמונה ותיצור איתך קשר.'
                        : 'Mutual interest! A matchmaker will step in and contact you.'}
                    </p>
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

          <p className="text-xs text-navy-400 text-center">
            {he
              ? 'הדגמה: הפרופילים והעניין ההדדי הם נתוני דוגמה. החיבור לנתונים אמיתיים יתבצע בהמשך.'
              : 'Demo: profiles and mutual interest are sample data. Real data will be connected later.'}
          </p>
        </section>
      </div>
    </div>
  )
}
