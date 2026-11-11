'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useInView } from './useInView'
import { useCycle, useStackScale, useTyping } from './motion'
import { SmartAssistantMockup } from './SmartAssistantMockup'

/* ── helpers ─────────────────────────────────────────────────────────────── */

/* ── mockups ─────────────────────────────────────────────────────────────── */

function MatchmakerMockup({ he, live }: { he: boolean; live: boolean }) {
  const step = useCycle(live, 3, 2200)
  const rows = [
    { n: he ? 'ר. ל.' : 'R. L.', a: he ? 'ירושלים' : 'Jerusalem' },
    { n: he ? 'ש. כ.' : 'S. K.', a: he ? 'בני ברק' : 'Bnei Brak' },
    { n: he ? 'מ. ד.' : 'M. D.', a: he ? 'אשדוד' : 'Ashdod' },
    { n: he ? 'י. ג.' : 'Y. G.', a: he ? 'חיפה' : 'Haifa' },
  ]
  const states = [
    { c: 'bg-green-500', t: he ? 'בטיפול' : 'In progress' },
    { c: 'bg-orange-400', t: he ? 'ממתין' : 'Waiting' },
    { c: 'bg-red-500', t: he ? 'דחוף' : 'Urgent' },
  ]
  return (
    <div className="rounded-3xl bg-navy-900/70 ring-1 ring-white/10 p-4 w-full">
      <div className="flex items-center justify-between mb-3 text-xs text-navy-200">
        <span>{he ? 'המועמדים שלי' : 'My candidates'}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1">{he ? 'הדמיה' : 'Preview'}</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const s = states[(i + step) % 3]
          return (
            <div key={r.n} className="[&:nth-child(4)]:hidden sm:[&:nth-child(4)]:flex flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 sm:py-2.5 transition-all duration-700"
              style={{ transform: step % 2 === 0 && i === step % 4 ? 'translateX(6px)' : 'translateX(0)' }}>
              <span className="w-9 h-9 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center">{r.n.charAt(0)}</span>
              <span className="flex-1 text-sm text-white">{r.n}<span className="text-navy-300 text-xs ms-2">{r.a}</span></span>
              <span className="flex items-center gap-2 text-xs text-navy-100 min-w-[84px] justify-end transition-all duration-500">
                <span key={s.t} className={`w-2.5 h-2.5 rounded-full ${s.c} animate-pulse`} />
                {s.t}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 rounded-2xl bg-burgundy-500/90 text-white text-xs px-3 py-2 flex items-center justify-between">
        <span>{he ? 'הצעה חדשה ממתינה לאישור' : 'A new proposal awaits approval'}</span>
        <span className="font-bold tabular-nums">{1 + (step % 3)}</span>
      </div>
    </div>
  )
}

function CandidateMockup({ he, live }: { he: boolean; live: boolean }) {
  const name = useTyping(he ? 'שרה כהן' : 'Sarah Cohen', live, 90, 5200)
  const phase = useCycle(live, 4, 1800)
  const pct = [25, 55, 85, 100][phase]
  return (
    <div className="rounded-3xl bg-white shadow-card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-navy-800">{he ? 'שאלון הכרות' : 'Intro form'}</span>
        <span className="text-xs text-navy-400">{he ? 'עמוד 1 מתוך 2' : 'Page 1 of 2'}</span>
      </div>
      <div className="h-2 rounded-full bg-navy-50 overflow-hidden mb-5">
        <div className="h-full rounded-full bg-burgundy-500 transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-semibold text-navy-600 mb-1.5">{he ? 'שם מלא' : 'Full name'}</p>
      <div className="rounded-2xl border border-navy-100 px-4 py-3 text-sm text-navy-800 min-h-[46px]">
        {name}<span className="inline-block w-px h-4 bg-navy-800 align-middle ms-0.5 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-navy-100 to-navy-50 transition-all duration-700"
            style={{ opacity: phase >= i ? 1 : 0.25, transform: phase >= i ? 'scale(1)' : 'scale(0.92)' }} />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs rounded-2xl px-3 py-2 transition-colors duration-500"
        style={{ background: phase === 3 ? '#ecfdf3' : '#f1f1f1', color: phase === 3 ? '#15803d' : '#4b5563' }}>
        <span className="font-bold">{phase === 3 ? '✓' : '...'}</span>
        {phase === 3 ? (he ? 'התמונות אושרו והפרופיל מוצג' : 'Photos approved, profile is live') : he ? 'התמונות ממתינות לאישור' : 'Photos await approval'}
      </div>
    </div>
  )
}

function SpotsMockup({ he, live }: { he: boolean; live: boolean }) {
  const q = useTyping(he ? 'בני ברק' : 'Bnei Brak', live, 110, 5200)
  const step = useCycle(live, 3, 2200)
  const chips = he ? ['מסעדות', 'לובי מלון', 'פארקים', 'אחר'] : ['Restaurants', 'Hotel lobby', 'Parks', 'Other']
  const spots = he
    ? [['קפה הנחל', 'בני ברק · תל אביב וגוש דן'], ['לובי מלון הים', 'אשדוד · לכיש'], ['פארק הגן', 'ירושלים']]
    : [['Nahal Cafe', 'Bnei Brak · Gush Dan'], ['Sea Hotel Lobby', 'Ashdod · Lachish'], ['Garden Park', 'Jerusalem']]
  return (
    <div className="rounded-3xl bg-white shadow-card p-5 w-full">
      <div className="rounded-full border border-navy-100 px-4 py-2.5 text-sm text-navy-800 flex items-center gap-2 mb-3">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-navy-300" />
        <span className="min-h-[20px]">{q}</span>
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {chips.map((c, i) => (
          <span key={c} className={`text-xs rounded-full px-3 py-1.5 border transition-all duration-500 ${step === i % 3 ? 'bg-navy-800 text-white border-navy-800 scale-105' : 'border-navy-100 text-navy-500'}`}>{c}</span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {spots.map(([n, m], i) => (
          <div key={n} className="rounded-2xl bg-[#f6f6f6] px-4 py-3 transition-all duration-700"
            style={{ opacity: (step + i) % 3 === 0 ? 1 : 0.55, transform: (step + i) % 3 === 0 ? 'translateX(0)' : 'translateX(-6px)' }}>
            <p className="text-sm font-bold text-navy-800">{n}</p>
            <p className="text-xs text-navy-400">{m}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── stacked cards ───────────────────────────────────────────────────────── */

interface Card {
  id: string
  tone: 'dark' | 'light'
  badge: string
  title: [string, string]
  text: string
  cta: { label: string; href: string }
  mock: (he: boolean, live: boolean, locale: string) => React.ReactNode
}

export function Showcase({ locale }: { locale: string }) {
  const he = locale === 'he'
  const listRef = useRef<HTMLDivElement>(null)

  const cards: Card[] = [
    {
      id: 'matchmakers', tone: 'dark',
      badge: he ? 'לשדכנים' : 'For matchmakers',
      title: he ? ['כל המועמדים, ', 'בלוח אחד.'] : ['Every candidate, ', 'one dashboard.'],
      text: he
        ? 'סטטוס לכל מועמד, הצעות שממתינות, ומה נתקע. הלוח מראה לכל שדכן מה עשה ומה נשאר לו לעשות.'
        : 'A status for each candidate, pending proposals and what is stuck. Each matchmaker sees what was done and what is left.',
      cta: { label: he ? 'הרשמת שדכנים' : 'Matchmaker sign-up', href: `/${locale}/register/matchmaker` },
      mock: (h, l) => <MatchmakerMockup he={h} live={l} />,
    },
    {
      id: 'candidates', tone: 'light',
      badge: he ? 'למיועדים ולמיועדות' : 'For candidates',
      title: he ? ['נרשמים פעם אחת, ', 'והפרופיל מוכן.'] : ['Sign up once, ', 'your profile is ready.'],
      text: he
        ? 'שאלון אחד, עד 5 תמונות, והפרופיל שלכם מופיע מיד. רק התמונות עוברות בדיקה לפני שהן מוצגות.'
        : 'One form, up to 5 photos, and your profile appears at once. Only photos are reviewed before they show.',
      cta: { label: he ? 'להרשמה' : 'Sign up', href: `/${locale}/register/male` },
      mock: (h, l) => <CandidateMockup he={h} live={l} />,
    },
    {
      id: 'spots', tone: 'dark',
      badge: he ? 'מקומות לדייט' : 'Date spots',
      title: he ? ['מקום מתאים ', 'בכל עיר.'] : ['A fitting place ', 'in every city.'],
      text: he
        ? 'מחפשים לפי עיר, אזור, שם מסעדה או סוג מקום, ומוצאים מקום שקט ונעים לפגישה.'
        : 'Search by city, region, restaurant name or type, and find a calm, pleasant place to meet.',
      cta: { label: he ? 'למקומות לדייט' : 'Browse spots', href: `/${locale}/date-spots` },
      mock: (h, l) => <SpotsMockup he={h} live={l} />,
    },
    {
      id: 'assistant', tone: 'light',
      badge: he ? 'העוזר החכם' : 'Smart assistant',
      title: he ? ['ספרו מה מחפשים. ', 'העוזר ימצא.'] : ['Tell us what you look for. ', 'The assistant finds.'],
      text: he
        ? 'אחרי ההרשמה, העוזר החכם מציע הצעות שמתאימות לבקשות שלכם. הפרטים אנונימיים עד שהשדכנים מחברים.'
        : 'After sign-up, the smart assistant suggests matches for what you describe. Details stay anonymous until a matchmaker connects you.',
      cta: { label: he ? 'לעוזר החכם' : 'Open the assistant', href: `/${locale}/smart-match` },
      mock: (_h, _l, loc) => <SmartAssistantMockup locale={loc} />,
    },
  ]

  useStackScale(listRef)

  return (
    <section className="px-3 sm:px-4 pt-20 sm:pt-28 pb-24 bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
        <p className="text-sm font-semibold tracking-widest text-burgundy-500 mb-3">{he ? 'מה יש כאן' : 'WHAT IS HERE'}</p>
        <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
          <span className="font-light">{he ? 'מערכת אחת, ' : 'One system, '}</span>
          <span className="font-bold text-burgundy-500">{he ? 'לכולם.' : 'for everyone.'}</span>
        </h2>
      </div>

      <div ref={listRef} className="max-w-5xl mx-auto flex flex-col gap-6">
        {cards.map((c, i) => (
          <StackCard key={c.id} card={c} index={i} total={cards.length} he={he} locale={locale} />
        ))}
      </div>
    </section>
  )
}

function StackCard({ card, index, total, he, locale }: { card: Card; index: number; total: number; he: boolean; locale: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25)
  const dark = card.tone === 'dark'
  return (
    <div
      ref={ref}
      data-stack
      className={`sticky rounded-[36px] overflow-hidden shadow-[0_30px_70px_rgba(0,21,41,0.22)] origin-top will-change-transform
        ${dark ? 'bg-navy-800 text-white' : 'bg-white text-navy-800'}`}
      style={{ top: `calc(6rem + ${index * 0.9}rem)`, zIndex: index + 1 }}
    >
      {dark && <div className="absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />}
      {dark && <div className="absolute -top-16 end-[-4rem] w-72 h-72 rounded-full bg-burgundy-400/25 blur-3xl animate-float" aria-hidden="true" />}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 items-center p-5 sm:p-10 lg:p-14 lg:min-h-[420px]">
        <div className="text-start">
          <div className="flex items-center gap-3 mb-3 sm:mb-5">
            <span className={`text-xs font-semibold rounded-full px-3 py-1.5 ${dark ? 'bg-white/10 text-burgundy-100 ring-1 ring-white/15' : 'bg-burgundy-50 text-burgundy-600'}`}>{card.badge}</span>
            <span className={`text-xs tabular-nums ${dark ? 'text-navy-300' : 'text-navy-300'}`} dir="ltr">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <h3 className="text-[1.75rem] sm:text-5xl leading-[1.1] mb-3 sm:mb-4">
            <span className="font-light">{card.title[0]}</span>
            <span className={`font-bold ${dark ? 'text-burgundy-300' : 'text-burgundy-500'}`}>{card.title[1]}</span>
          </h3>
          <p className={`text-sm sm:text-lg max-w-md mb-4 sm:mb-7 ${dark ? 'text-navy-100' : 'text-navy-500'}`}>{card.text}</p>
          <Link
            href={card.cta.href}
            className={`inline-flex items-center gap-2 rounded-full h-11 sm:h-12 px-6 sm:px-7 text-sm font-bold transition-colors ${
              dark ? 'bg-burgundy-400 hover:bg-burgundy-300 text-white glow-burgundy' : 'bg-navy-800 hover:bg-navy-700 text-white'
            }`}
          >
            {card.cta.label} <span aria-hidden>{he ? '←' : '→'}</span>
          </Link>
        </div>
        <div className="w-full max-w-md mx-auto lg:max-w-none">{card.mock(he, inView, locale)}</div>
      </div>
    </div>
  )
}
