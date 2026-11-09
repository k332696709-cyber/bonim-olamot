'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from './useInView'

/**
 * Animated phone-style chat (Shmili "WhatsApp" demo), adapted to a candidate
 * starting the registration. Messages appear one by one, then the loop restarts.
 * Illustrative content only.
 */
export function ChatMockup({ locale }: { locale: string }) {
  const isHe = locale === 'he'
  const [step, setStep] = useState(0)

  const TOTAL = 6 // 0..5 messages, 6 = hold before restart

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(TOTAL)
      return
    }
    const t = setTimeout(
      () => setStep((s) => (s >= TOTAL ? 0 : s + 1)),
      step >= TOTAL ? 3800 : step === 0 ? 700 : 1500,
    )
    return () => clearTimeout(t)
  }, [step])

  const typing = step > 0 && step < TOTAL && step % 2 === 1 // "system" is about to answer

  const bubble = (shown: boolean) =>
    `transition-all duration-500 ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 h-0 overflow-hidden'}`

  return (
    <div className="relative w-full max-w-sm mx-auto" aria-hidden="true">
      {/* floating chip */}
      <div
        className={`absolute -top-4 end-2 z-10 flex items-center gap-2 rounded-full bg-white text-navy-800
          text-xs font-semibold px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.3)]
          transition-all duration-500 ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <span className="w-5 h-5 rounded-full bg-burgundy-500 text-white flex items-center justify-center text-[11px]">✓</span>
        {isHe ? 'הפרופיל נוצר · שדכנית שויכה' : 'Profile created · matchmaker assigned'}
      </div>

      <div className="rounded-[32px] bg-[#f1f1f1] text-navy-800 shadow-[0_40px_80px_rgba(0,0,0,0.45)] overflow-hidden animate-float">
        {/* header */}
        <div className="bg-navy-700 text-white px-5 py-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-burgundy-500 flex items-center justify-center font-bold text-sm">
            {isHe ? 'בע' : 'BO'}
          </span>
          <div className="leading-tight">
            <p className="font-bold text-sm">{isHe ? 'בונים עולמות' : 'Bonim Olamot'}</p>
            <p className="text-xs text-navy-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {typing ? (isHe ? 'מקלידה...' : 'typing…') : isHe ? 'מחוברת עכשיו' : 'online now'}
            </p>
          </div>
        </div>

        {/* messages */}
        <div className="px-4 py-5 flex flex-col gap-3 min-h-[330px] text-sm">
          <div className={`self-start max-w-[80%] rounded-2xl rounded-ss-sm bg-white px-4 py-2.5 shadow-sm ${bubble(step >= 1)}`}>
            {isHe ? 'שלום, אני מחפשת שידוך. איך מתחילים?' : 'Hello, I’m looking for a match. How do we start?'}
          </div>
          <div className={`self-end max-w-[85%] rounded-2xl rounded-se-sm bg-navy-800 text-white px-4 py-2.5 ${bubble(step >= 2)}`}>
            {isHe
              ? 'ברוכה הבאה! ממלאים שאלון קצר, ושדכנית אישית תלווה אותך.'
              : 'Welcome! Fill in a short questionnaire and a personal matchmaker will guide you.'}
          </div>
          <div className={`self-start max-w-[80%] rounded-2xl rounded-ss-sm bg-white px-4 py-2.5 shadow-sm ${bubble(step >= 3)}`}>
            {isHe ? 'מעולה, אפשר להתחיל עכשיו?' : 'Great, can I start now?'}
          </div>
          <div className={`self-end max-w-[85%] rounded-2xl rounded-se-sm bg-navy-800 text-white px-3 py-3 ${bubble(step >= 4)}`}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-burgundy-500 flex items-center justify-center text-[10px] font-bold">FORM</span>
              <div className="leading-tight">
                <p className="font-semibold">{isHe ? 'שאלון הרשמה' : 'Registration form'}</p>
                <p className="text-xs text-navy-200">{isHe ? 'כ-5 דקות · דיסקרטי' : '~5 minutes · confidential'}</p>
              </div>
            </div>
          </div>
          <div className={`self-center rounded-full bg-navy-800 text-white text-xs font-semibold px-4 py-2 ${bubble(step >= 5)}`}>
            {isHe ? '✓ השאלון נשלח · השדכנית תחזור אלייך' : '✓ Submitted · your matchmaker will reach out'}
          </div>
        </div>
      </div>
    </div>
  )
}
