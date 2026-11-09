'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from './useInView'

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (prefersReducedMotion()) {
      setN(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, duration])
  return n
}

/**
 * Animated matchmaker-dashboard preview (Shmili "from the outside a website,
 * from the inside a system" demo). Numbers are illustrative sample data.
 */
export function DashboardMockup({ locale }: { locale: string }) {
  const isHe = locale === 'he'
  const { ref, inView } = useInView<HTMLDivElement>(0.25)

  const active = useCountUp(142, inView)
  const goal = 180
  const pct = Math.round((active / goal) * 100)

  const bars = [
    { label: isHe ? 'הרשמה' : 'Signed up', v: 48 },
    { label: isHe ? 'סקירה' : 'Review', v: 37 },
    { label: isHe ? 'הצעה' : 'Proposal', v: 28 },
    { label: isHe ? 'פגישה' : 'Meeting', v: 22 },
    { label: isHe ? 'אירוסין' : 'Engaged', v: 16 },
  ]
  const max = 48

  const feed = [
    isHe ? 'מועמדת חדשה נרשמה · שויכה לשדכנית' : 'New candidate registered · assigned to a matchmaker',
    isHe ? 'הצעת שידוך נשלחה לשני הצדדים' : 'Match proposal sent to both sides',
    isHe ? 'פגישה נקבעה ליום שלישי 20:00' : 'First meeting set for Tuesday 20:00',
  ]

  return (
    <div ref={ref} className="relative max-w-4xl mx-auto" aria-hidden="true">
      <div className="rounded-[32px] bg-white shadow-[0_40px_80px_rgba(0,21,41,0.18)] overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-navy-50">
          <div>
            <p className="text-lg sm:text-xl font-bold text-navy-800">{isHe ? 'בוקר טוב, שדכנית' : 'Good morning, matchmaker'}</p>
            <span className="block h-0.5 w-10 bg-burgundy-500 mt-1.5 rounded-full" />
          </div>
          <span className="text-xs font-semibold text-navy-400 bg-navy-50 rounded-full px-3 py-1.5">
            {isHe ? 'הדמיה' : 'Preview'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 p-5 sm:p-8">
          {/* counter card */}
          <div className="md:col-span-2 rounded-3xl bg-navy-800 text-white p-6 flex flex-col justify-between min-h-[200px]">
            <p className="text-sm text-navy-200">{isHe ? 'מועמדים פעילים' : 'Active candidates'}</p>
            <p className="text-6xl sm:text-7xl font-light tabular-nums my-3" dir="ltr">{active}</p>
            <div>
              <div className="flex justify-between text-xs text-navy-200 mb-2">
                <span>{isHe ? `יעד חודשי: ${goal}` : `Monthly goal: ${goal}`}</span>
                <span dir="ltr">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-burgundy-400 transition-[width] duration-100"
                  style={{ width: `${Math.min(100, (active / goal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* bars */}
          <div className="md:col-span-3 rounded-3xl bg-[#f1f1f1] p-6">
            <p className="text-sm font-semibold text-navy-700 mb-4">{isHe ? 'סטטוס שידוכים' : 'Match status'}</p>
            <div className="flex items-end justify-between gap-3 h-36">
              {bars.map((b, i) => (
                <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs font-semibold text-navy-700 tabular-nums" dir="ltr">{b.v}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-burgundy-500 to-burgundy-400 transition-all duration-1000 ease-out"
                    style={{
                      height: inView ? `${(b.v / max) * 100}%` : '4%',
                      transitionDelay: `${i * 120}ms`,
                      opacity: 1 - i * 0.12,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-3 mt-2">
              {bars.map((b) => (
                <span key={b.label} className="flex-1 text-center text-[11px] text-navy-400">{b.label}</span>
              ))}
            </div>
          </div>

          {/* feed */}
          <div className="md:col-span-5 rounded-3xl border border-navy-100 p-5">
            <p className="text-sm font-semibold text-navy-700 mb-3">{isHe ? 'המערכת סיכמה לך' : 'Your system summary'}</p>
            <ul className="flex flex-col gap-2.5">
              {feed.map((f, i) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-navy-700 transition-all duration-700"
                  style={{
                    transitionDelay: `${600 + i * 350}ms`,
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  <span className="w-6 h-6 shrink-0 rounded-full bg-burgundy-500 text-white text-xs flex items-center justify-center">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
