'use client'

import { useRef } from 'react'
import { useInView } from './useInView'
import { useCycle, useStackScale } from './motion'

/* ── small live visuals, one per step ───────────────────────────────────── */

function FormVisual({ he, live }: { he: boolean; live: boolean }) {
  const step = useCycle(live, 4, 1300)
  const rows = he ? ['שם ופרטים', 'ערכים ואופי', 'אורח חיים', 'תמונות'] : ['Name & details', 'Values & character', 'Lifestyle', 'Photos']
  return (
    <div className="rounded-3xl bg-white/10 ring-1 ring-white/15 p-4 w-full flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <div key={r} className="flex items-center gap-3">
          <span className={`w-6 h-6 shrink-0 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-500 ${i <= step ? 'bg-burgundy-400 text-white' : 'bg-white/15 text-white/50'}`}>
            {i <= step ? '✓' : i + 1}
          </span>
          <div className="flex-1">
            <p className="text-xs text-navy-100 mb-1">{r}</p>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-burgundy-300 transition-[width] duration-1000" style={{ width: i < step ? '100%' : i === step ? '60%' : '0%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewVisual({ he, live }: { he: boolean; live: boolean }) {
  const step = useCycle(live, 4, 1300)
  const items = he ? ['ערכים תואמים', 'אופי משלים', 'אורח חיים קרוב'] : ['Matching values', 'Complementary character', 'Close lifestyle']
  return (
    <div className="rounded-3xl bg-[#f6f6f6] p-4 w-full flex flex-col gap-2.5">
      {items.map((t, i) => (
        <div key={t} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-sm transition-all duration-500"
          style={{ opacity: i <= step ? 1 : 0.4, transform: i <= step ? 'translateX(0)' : 'translateX(-8px)' }}>
          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors duration-500 ${i <= step ? 'bg-green-500 text-white' : 'bg-navy-100 text-navy-400'}`}>{i <= step ? '✓' : ''}</span>
          <span className="text-sm text-navy-800">{t}</span>
        </div>
      ))}
      <div className="rounded-2xl bg-navy-800 text-white text-sm px-3 py-2.5 flex items-center justify-between transition-opacity duration-500" style={{ opacity: step === 3 ? 1 : 0.35 }}>
        <span>{he ? 'נמצאו מועמדים מתאימים' : 'Compatible candidates found'}</span>
        <span className="font-bold tabular-nums">3</span>
      </div>
    </div>
  )
}

function ProposalVisual({ he, live }: { he: boolean; live: boolean }) {
  const step = useCycle(live, 3, 1700)
  const labels = he ? ['ההצעה נשלחה', 'צד אחד מעוניין', 'שני הצדדים מעוניינים'] : ['Proposal sent', 'One side interested', 'Both sides interested']
  return (
    <div className="rounded-3xl bg-white/10 ring-1 ring-white/15 p-5 w-full">
      <div className="flex items-center justify-between gap-2 mb-5">
        <span className={`w-14 h-14 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-500 ${step >= 1 ? 'bg-burgundy-400 text-white scale-110' : 'bg-white/15 text-white'}`}>{he ? 'ר' : 'R'}</span>
        <div className="flex-1 h-0.5 bg-white/15 relative overflow-hidden rounded-full">
          <div className="absolute inset-y-0 start-0 bg-burgundy-300 transition-[width] duration-1000" style={{ width: step === 0 ? '10%' : step === 1 ? '50%' : '100%' }} />
        </div>
        <span className={`w-14 h-14 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-500 ${step >= 2 ? 'bg-burgundy-400 text-white scale-110' : 'bg-white/15 text-white'}`}>{he ? 'מ' : 'M'}</span>
      </div>
      <div className="text-center text-sm rounded-2xl bg-white/10 px-3 py-2.5 text-white" key={step}>{labels[step]}</div>
    </div>
  )
}

function SupportVisual({ he, live }: { he: boolean; live: boolean }) {
  const step = useCycle(live, 5, 1300)
  const stages = he ? ['בדיקה', 'הצעה', 'פגישה א', 'פגישה ב', 'סיום'] : ['Check', 'Proposal', 'Meeting 1', 'Meeting 2', 'Done']
  return (
    <div className="rounded-3xl bg-[#f6f6f6] p-5 w-full">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-3 inset-x-3 h-0.5 bg-navy-100" />
        <div className="absolute top-3 start-3 h-0.5 bg-burgundy-500 transition-[width] duration-1000" style={{ width: `calc(${(step / 4) * 100}% - ${step === 4 ? 24 : 0}px)` }} />
        {stages.map((s, i) => (
          <div key={s} className="relative flex flex-col items-center gap-2 w-12">
            <span className={`w-6 h-6 rounded-full border-2 transition-all duration-500 ${i <= step ? 'bg-burgundy-500 border-burgundy-500 scale-110' : 'bg-white border-navy-200'}`} />
            <span className={`text-[10px] text-center leading-tight transition-colors ${i <= step ? 'text-navy-800 font-semibold' : 'text-navy-300'}`}>{s}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-navy-700 mt-5">{he ? 'מלווים בכל שלב, עד הסיום' : 'Supported at every stage, to the end'}</p>
    </div>
  )
}

/* ── the stacked cards ──────────────────────────────────────────────────── */

export function HowItWorks({ locale }: { locale: string }) {
  const he = locale === 'he'
  const listRef = useRef<HTMLDivElement>(null)
  useStackScale(listRef)

  const steps = [
    {
      tone: 'dark' as const,
      title: he ? 'הרשמה ויצירת פרופיל' : 'Register & create a profile',
      text: he ? 'המועמד/ת ממלאים שאלון מפורט הכולל ערכים, אופי ואורח חיים.' : 'Candidates complete a detailed questionnaire covering values, character and lifestyle.',
      visual: (live: boolean) => <FormVisual he={he} live={live} />,
    },
    {
      tone: 'light' as const,
      title: he ? 'סקירה אישית על ידי שדכן/ית' : 'Personal review by a matchmaker',
      text: he ? 'שדכן/ית מוסמך/ת עוברים על הפרופיל ומתאימים מועמדים עם ראייה מקצועית.' : 'A certified matchmaker reviews the profile and finds compatible candidates with professional insight.',
      visual: (live: boolean) => <ReviewVisual he={he} live={live} />,
    },
    {
      tone: 'dark' as const,
      title: he ? 'הצעת שידוך' : 'Match proposal',
      text: he ? 'ההצעה מוצגת לשני הצדדים בדיסקרטיות ובכבוד. כל הכרעה בידי המועמד/ת.' : 'The proposal is presented to both parties with discretion and respect. Every decision belongs to the candidate.',
      visual: (live: boolean) => <ProposalVisual he={he} live={live} />,
    },
    {
      tone: 'light' as const,
      title: he ? 'ליווי עד לסיום' : 'Support until conclusion',
      text: he ? 'אנו עומדים לצד המועמדים לאורך כל התהליך, עד לסיום מוצלח.' : 'We stand by candidates throughout the entire process, until a successful conclusion.',
      visual: (live: boolean) => <SupportVisual he={he} live={live} />,
    },
  ]

  return (
    <section className="px-3 sm:px-4 pt-10 sm:pt-16 pb-24 bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
        <p className="text-sm font-semibold tracking-widest text-burgundy-500 mb-3">{he ? 'התהליך' : 'THE PROCESS'}</p>
        <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
          <span className="font-light">{he ? 'איך זה ' : 'How it '}</span>
          <span className="font-bold text-burgundy-500">{he ? 'עובד.' : 'works.'}</span>
        </h2>
      </div>

      <div ref={listRef} className="max-w-5xl mx-auto flex flex-col gap-6">
        {steps.map((s, i) => (
          <StepCard key={i} index={i} total={steps.length} {...s} />
        ))}
      </div>
    </section>
  )
}

function StepCard({ index, total, tone, title, text, visual }: {
  index: number; total: number; tone: 'dark' | 'light'; title: string; text: string; visual: (live: boolean) => React.ReactNode
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25)
  const dark = tone === 'dark'
  return (
    <div
      ref={ref}
      data-stack
      className={`sticky rounded-[36px] overflow-hidden shadow-[0_30px_70px_rgba(0,21,41,0.22)] origin-top will-change-transform ${dark ? 'bg-navy-800 text-white' : 'bg-white text-navy-800'}`}
      style={{ top: `calc(6rem + ${index * 0.9}rem)`, zIndex: index + 1 }}
    >
      {dark && <div className="absolute inset-0 bg-grid-dark opacity-60" aria-hidden="true" />}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-12 items-center p-5 sm:p-10 lg:p-14 lg:min-h-[360px]">
        <div className="text-start">
          <div className="flex items-center gap-3 mb-3 sm:mb-5">
            <span className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold tabular-nums ${dark ? 'bg-burgundy-400 text-white' : 'bg-navy-800 text-white'}`} dir="ltr">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`text-xs tabular-nums ${dark ? 'text-navy-300' : 'text-navy-300'}`} dir="ltr">
              {index + 1} / {total}
            </span>
          </div>
          <h3 className="text-[1.75rem] sm:text-4xl font-bold leading-[1.15] mb-3">{title}</h3>
          <p className={`text-sm sm:text-lg max-w-md ${dark ? 'text-navy-100' : 'text-navy-500'}`}>{text}</p>
        </div>
        <div className="w-full max-w-md mx-auto lg:max-w-none">{visual(inView)}</div>
      </div>
    </div>
  )
}
