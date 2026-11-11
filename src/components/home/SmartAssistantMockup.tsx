'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from './useInView'

/**
 * Animated preview of the smart assistant: a candidate asks, the assistant thinks and
 * suggests anonymous matches. All names and numbers are illustrative sample data.
 */
export function SmartAssistantMockup({ locale }: { locale: string }) {
  const he = locale === 'he'
  const { ref, inView } = useInView<HTMLDivElement>(0.3)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion()) {
      setStep(4)
      return
    }
    const timers = [
      setTimeout(() => setStep(1), 400), // question
      setTimeout(() => setStep(2), 1500), // typing
      setTimeout(() => setStep(3), 2900), // answer
      setTimeout(() => setStep(4), 3600), // cards
    ]
    return () => timers.forEach(clearTimeout)
  }, [inView])

  const matches = [
    { letter: 'ר', meta: he ? 'גיל 24 · ירושלים · ליטאית' : 'Age 24 · Jerusalem · Litvish', score: 94 },
    { letter: 'ש', meta: he ? 'גיל 26 · בני ברק · חסידית' : 'Age 26 · Bnei Brak · Hasidic', score: 89 },
    { letter: 'מ', meta: he ? 'גיל 25 · בית שמש · ספרדית' : 'Age 25 · Beit Shemesh · Sephardic', score: 85 },
  ]

  return (
    <div ref={ref} className="relative max-w-xl mx-auto w-full" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[48px] bg-burgundy-400/20 blur-3xl animate-float" />
      <div className="relative rounded-[32px] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-navy-900 text-white">
          <span className="w-10 h-10 rounded-full bg-burgundy-400 flex items-center justify-center text-lg">✦</span>
          <div className="flex-1">
            <p className="font-bold leading-tight">{he ? 'העוזר החכם' : 'Smart assistant'}</p>
            <p className="text-xs text-navy-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {he ? 'מחובר/ת' : 'Online'}
            </p>
          </div>
          <span className="text-[10px] font-semibold bg-white/10 rounded-full px-3 py-1">{he ? 'הדמיה' : 'Preview'}</span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col gap-3 min-h-[280px] sm:min-h-[360px] bg-[#f6f6f6]">
          <Bubble show={step >= 1} mine>
            {he ? 'מחפשת בחור ישיבתי מירושלים, גיל 25 עד 28' : 'Looking for a yeshiva guy from Jerusalem, 25 to 28'}
          </Bubble>

          {step === 2 && (
            <div className="self-end flex gap-1.5 rounded-2xl bg-white shadow-sm px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}

          <Bubble show={step >= 3}>
            {he ? 'מצאתי 3 הצעות שמתאימות למה שתיארת. הפרטים מוצגים בצורה אנונימית.' : 'I found 3 suggestions that fit your description. Details are shown anonymously.'}
          </Bubble>

          <div className="flex flex-col gap-2.5 mt-1">
            {matches.map((m, i) => (
              <div
                key={m.letter}
                className="flex items-center gap-3 rounded-2xl bg-white shadow-sm px-4 py-3 transition-all duration-700"
                style={{
                  transitionDelay: `${i * 220}ms`,
                  opacity: step >= 4 ? 1 : 0,
                  transform: step >= 4 ? 'translateY(0)' : 'translateY(14px)',
                }}
              >
                <span className="w-11 h-11 rounded-full bg-navy-800 text-white font-bold flex items-center justify-center">{m.letter}.</span>
                <span className="flex-1 text-sm text-navy-700">{m.meta}</span>
                <span className="text-sm font-bold text-burgundy-500 tabular-nums" dir="ltr">{m.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Bubble({ show, mine, children }: { show: boolean; mine?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-500 ${
        mine ? 'self-end bg-navy-800 text-white' : 'self-start bg-white text-navy-800 shadow-sm'
      }`}
      style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', display: show ? 'block' : 'none' }}
    >
      {children}
    </div>
  )
}
