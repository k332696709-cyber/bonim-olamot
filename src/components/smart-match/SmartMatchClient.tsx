'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loadPrefs, savePrefs } from '@/lib/matchmaking/prefsStore'
import { DateIdeasModal } from '@/components/smart-match/DateIdeasModal'
import { loadCandidate, type CandidateState } from '@/lib/auth/candidate'
import {
  applyPrefs, describePrefs, isMale,
  type AnyProfile, type Prefs, type Proposal,
} from '@/lib/matchmaking/assistant'

type LiveProposal = Proposal & { state: 'none' | 'interested' | 'mutual' | 'passed' }
interface Turn { role: 'user' | 'assistant'; text: string; sources?: { title: string; url: string }[] }

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
          <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-2xl mb-5">✦</div>
          <h2 className="text-2xl font-bold text-navy-800 mb-2">
            {pending
              ? (he ? 'צריך להשלים את השאלון' : 'Please complete the questionnaire')
              : (he ? 'העוזר החכם נפתח אחרי השלמת השאלון' : 'The Smart Assistant opens once you complete the questionnaire')}
          </h2>
          <p className="text-navy-500 mb-8">
            {pending
              ? (he ? 'אחרי שתשלימו את שאלון ההיכרות עד 100%, תוכלו לראות הצעות התאמה מדורגות ולדייק אותן עם העוזר.' : 'Once you complete the questionnaire to 100% you can see ranked match suggestions and refine them with the assistant.')
              : (he ? 'נרשמים או נכנסים, ממלאים את שאלון ההיכרות עד 100%, ואז רואים הצעות התאמה מדורגות ומדייקים אותן עם העוזר.' : 'Register or sign in, complete the questionnaire to 100%, and then you can see ranked match suggestions and refine them with the assistant.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {pending ? (
              <Link href={`/${locale}/personal/questionnaire`}
                className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm inline-flex items-center justify-center transition-colors">
                {he ? 'לשאלון' : 'To the questionnaire'}
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
  const [all, setAll] = useState<LiveProposal[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [chat, setChat] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const [datesId, setDatesId] = useState<string | null>(null)

  // The proposals are built on the server from real approved profiles; only anonymous fields arrive.
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
      } catch {
        if (alive) setLoadError(true)
      }
    })()
    return () => { alive = false }
  }, [])

  // The filters live in this browser, so the list in the personal area applies them too.
  useEffect(() => { setPrefs(loadPrefs()) }, [])
  useEffect(() => { savePrefs(prefs) }, [prefs])

  const list = all ?? []
  const cities = useMemo(() => Array.from(new Set(list.map((p) => p.city).filter(Boolean))), [list])
  const shown = useMemo(() => applyPrefs(list, prefs, me), [list, prefs, me])

  const welcome = he
    ? 'שלום! אני כאן לעזור בכל מה שקשור לשידוכים ולדייטים. אפשר לשאול אותי על פגישה ראשונה, על מקומות לדייט, על בירורים או איך לסרב בכבוד, ואפשר גם לדייק את ההצעות: עיר, טווח גילאים או סגנון.'
    : 'Hi! I ranked suggestions for you by compatibility. Tell me what to change: a city, an age range or a style.'

  const chips = he
    ? ['על מה לדבר בפגישה ראשונה?', 'איפה כדאי לצאת לדייט?', 'כמה פגישות צריך?', 'איך לסרב בצורה מכובדת?', 'נקה סינון']
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
      setChat((c) => [...c, { role: 'assistant', text: data.reply, sources: Array.isArray(data.sources) ? data.sources : undefined }])
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

  const filterText = describePrefs(prefs, he)

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      <p className="mb-6 text-sm text-navy-500 text-center">
        {isMale(me)
          ? (he ? `שלום ${me.firstName}, אלו הצעות של מיועדות` : `Hi ${me.firstName}, here are suggestions of women`)
          : (he ? `שלום ${me.firstName}, אלו הצעות של מיועדים` : `Hi ${me.firstName}, here are suggestions of men`)}
      </p>

      {datesId && <DateIdeasModal id={datesId} he={he} onClose={() => setDatesId(null)} />}
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
                <p className="whitespace-pre-wrap">{t.text}</p>
                {t.sources && t.sources.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 text-xs">
                    <li className="text-navy-200">{he ? 'מקורות ולקריאה נוספת:' : 'Sources and further reading:'}</li>
                    {t.sources.map((src) => (
                      <li key={src.url + src.title}>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline text-white/90 hover:text-white break-words">{src.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
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

        {/* ── Summary: the suggestions themselves are in the personal area ── */}
        <section className="lg:col-span-3 flex flex-col gap-5">
          <div className="rounded-[28px] bg-white shadow-card p-8 flex flex-col gap-4">
            <h2 className="text-2xl text-navy-800 font-bold">{he ? 'דיוק ההצעות' : 'Refine your suggestions'}</h2>
            <p className="text-navy-600">
              {he
                ? 'כאן מדייקים. ההצעות עצמן נמצאות באזור האישי שלך, ושם תראו אותן אחרי הדיוק.'
                : 'Refine here. The suggestions themselves are in your personal area, where you will see them after refining.'}
            </p>
            {all === null && !loadError && <p className="text-sm text-navy-400">{he ? 'בודקים...' : 'Checking…'}</p>}
            {loadError && <p className="text-sm text-navy-500">{he ? 'לא הצלחנו לטעון הצעות. נסו לרענן.' : 'We could not load suggestions. Please refresh.'}</p>}
            {all !== null && (
              <p className="text-lg text-navy-800">
                {he
                  ? `${shown.length} ${shown.length === 1 ? 'הצעה מתאימה' : 'הצעות מתאימות'}${filterText ? ' לסינון שלך' : ''}`
                  : `${shown.length} matching suggestion${shown.length === 1 ? '' : 's'}${filterText ? ' for your filter' : ''}`}
              </p>
            )}
            {list.some((p) => p.state === 'mutual') && (
              <div className="rounded-2xl bg-navy-50 px-5 py-4 flex flex-col gap-3">
                <p className="font-bold text-navy-800">{he ? 'מקומות לדייט' : 'Date places'}</p>
                <p className="text-sm text-navy-600">
                  {he
                    ? 'יש לך עניין הדדי. אפשר לראות מקומות קרובים לכל אחד מכם, ומקומות באמצע אם אתם גרים רחוק.'
                    : 'You have mutual interest. See places near each of you, and in the middle if you live far apart.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.filter((p) => p.state === 'mutual').map((p) => (
                    <button
                      key={p.id} type="button" onClick={() => setDatesId(p.id)}
                      className="h-11 px-5 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold"
                    >
                      {he ? `מקומות לדייט עם ${p.name || p.initial}` : `Date places with ${p.name || p.initial}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Link
              href={`/${locale}/personal#proposals`}
              className="self-start h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm inline-flex items-center"
            >
              {he ? 'לצפייה בהצעות באזור האישי' : 'See the suggestions in my personal area'}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
