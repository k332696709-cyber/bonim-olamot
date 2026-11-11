'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { BotAction } from '@/lib/bot/botRules'

interface Msg {
  role: 'bot' | 'user'
  text?: string
  /** A "sent form" card instead of plain text. */
  action?: Exclude<BotAction, null>
}

const LIMIT = 400

/**
 * Real chatbot for the home hero. Answers automatically (Claude when configured,
 * rule-based otherwise) and sends the registration form for men / women / matchmakers.
 */
export function BotChat({ locale }: { locale: string }) {
  const he = locale === 'he'
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(true)
  const boxRef = useRef<HTMLDivElement>(null)

  const greeting = he
    ? 'שלום! אני העוזר/ת של בונים עולמות. אפשר לשאול אותי על התהליך והפרטיות, ואני יכול/ה לשלוח לך ישר את טופס ההרשמה. מי מחפש/ת שידוך?'
    : 'Hello! I’m the Bonim Olamot assistant. Ask me about the process and privacy, and I can send you the registration form right here. Who is looking for a match?'

  const chips = he
    ? ['אני מיועד (בחור)', 'אני מיועדת (בחורה)', 'איך זה עובד?', 'מה לגבי פרטיות?', 'אני שדכנית']
    : ['I’m a man', 'I’m a woman', 'How does it work?', 'What about privacy?', 'I’m a matchmaker']

  // Greeting types in once, then the bot waits for the user.
  useEffect(() => {
    const t = setTimeout(() => {
      setTyping(false)
      setMsgs([{ role: 'bot', text: greeting }])
    }, 900)
    return () => clearTimeout(t)
  }, [greeting])

  useEffect(() => {
    const el = boxRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, LIMIT)
    if (!text || busy) return
    setInput('')
    setBusy(true)
    const history = msgs.filter((m) => m.text).map((m) => ({ role: m.role, text: m.text as string }))
    setMsgs((m) => [...m, { role: 'user', text }])
    setTyping(true)
    try {
      const res = await fetch('/api/ai/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, locale: he ? 'he' : 'en', history }),
      })
      if (res.status === 429) throw new Error('rate')
      const data = await res.json()
      if (!res.ok) throw new Error('bad')
      await new Promise((r) => setTimeout(r, 450)) // let the typing dots show
      const next: Msg[] = [{ role: 'bot', text: data.reply }]
      if (data.action) next.push({ role: 'bot', action: data.action })
      setMsgs((m) => [...m, ...next])
    } catch (e) {
      const rate = e instanceof Error && e.message === 'rate'
      setMsgs((m) => [
        ...m,
        {
          role: 'bot',
          text: rate
            ? he ? 'אנחנו מקבלים הרבה הודעות. נסו שוב בעוד דקה.' : 'We’re getting a lot of messages. Please try again in a minute.'
            : he ? 'משהו השתבש. נסו שוב בעוד רגע.' : 'Something went wrong. Please try again in a moment.',
        },
      ])
    } finally {
      setTyping(false)
      setBusy(false)
    }
  }

  const card = (a: Exclude<BotAction, null>) => {
    const map = {
      form_male:       { href: `/${locale}/register/male`,       title: he ? 'טופס הרשמה – מיועדים' : 'Registration form – men',       cta: he ? 'למילוי הטופס' : 'Open the form' },
      form_female:     { href: `/${locale}/register/female`,     title: he ? 'טופס הרשמה – מיועדות' : 'Registration form – women',     cta: he ? 'למילוי הטופס' : 'Open the form' },
      form_matchmaker: { href: `/${locale}/register/matchmaker`, title: he ? 'הרשמת שדכנים' : 'Matchmaker registration',              cta: he ? 'למילוי הטופס' : 'Open the form' },
      contact:         { href: `/${locale}/contact`,             title: he ? 'יצירת קשר' : 'Contact us',                              cta: he ? 'לעמוד צור קשר' : 'Go to Contact' },
    }[a]
    return (
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-burgundy-500 flex items-center justify-center text-[10px] font-bold shrink-0">
          {a === 'contact' ? '' : 'FORM'}
        </span>
        <div className="leading-tight flex-1 min-w-0">
          <p className="font-semibold truncate">{map.title}</p>
          <Link href={map.href} className="inline-block mt-1.5 rounded-full bg-white text-navy-800 text-xs font-bold px-4 py-1.5 hover:bg-navy-50 transition-colors">
            {map.cta} {he ? '←' : '→'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="rounded-[32px] bg-[#f1f1f1] text-navy-800 shadow-[0_40px_80px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="bg-navy-700 text-white px-5 py-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center font-bold text-sm">
            {he ? 'בע' : 'BO'}
          </span>
          <div className="leading-tight">
            <p className="font-bold text-sm">{he ? 'העוזר/ת של בונים עולמות' : 'Bonim Olamot assistant'}</p>
            <p className="text-xs text-navy-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {typing ? (he ? 'מקליד/ה...' : 'typing…') : he ? 'מחובר/ת' : 'online now'}
            </p>
          </div>
        </div>

        <div
          ref={boxRef}
          className="px-4 py-5 flex flex-col gap-3 text-sm h-[340px] overflow-y-auto"
          aria-live="polite"
        >
          {msgs.map((m, i) =>
            m.action ? (
              <div key={i} className="self-start max-w-[92%] rounded-2xl rounded-ss-sm bg-navy-800 text-white px-3 py-3">
                {card(m.action)}
              </div>
            ) : m.role === 'user' ? (
              <div key={i} className="self-end max-w-[85%] rounded-2xl rounded-se-sm bg-burgundy-500 text-white px-4 py-2.5 break-words">
                {m.text}
              </div>
            ) : (
              <div key={i} className="self-start max-w-[88%] rounded-2xl rounded-ss-sm bg-white px-4 py-2.5 shadow-sm">
                {m.text}
              </div>
            ),
          )}
          {typing && (
            <div className="self-start rounded-2xl rounded-ss-sm bg-white px-4 py-3 shadow-sm flex gap-1" aria-label={he ? 'מקליד/ה' : 'typing'}>
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              disabled={busy}
              className="rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs text-navy-700 hover:bg-navy-50 disabled:opacity-50 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="p-3 pt-1.5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={LIMIT}
            placeholder={he ? 'כתבו הודעה...' : 'Type a message…'}
            aria-label={he ? 'הודעה לעוזר' : 'Message to the assistant'}
            className="flex-1 min-w-0 h-11 rounded-full bg-white border border-navy-100 px-4 text-sm text-navy-800
              placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="h-11 px-5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-bold text-sm disabled:opacity-50 transition-colors"
          >
            {he ? 'שליחה' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
