'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from './useInView'

type Phase = 'start' | 'rise' | 'fill' | 'out' | 'gone'

const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'

/**
 * The opening animation of the home page, on every visit. A burgundy half circle (a dome, like a
 * world coming up over the horizon) rises from the bottom while rings spread out from it, then it
 * swells to fill the screen and the name appears. Then the screen opens like two doors, sliding
 * apart to show the site.
 */
export function IntroSplash({ title, subtitle }: { title: string; subtitle: string }) {
  const [phase, setPhase] = useState<Phase>('start')

  useEffect(() => {
    if (prefersReducedMotion()) { setPhase('gone'); return }
    document.body.style.overflow = 'hidden'
    const t = [
      setTimeout(() => setPhase('rise'), 80),
      setTimeout(() => setPhase('fill'), 1150),
      setTimeout(() => setPhase('out'), 3000),
      setTimeout(() => { setPhase('gone'); document.body.style.overflow = '' }, 4000),
    ]
    return () => { t.forEach(clearTimeout); document.body.style.overflow = '' }
  }, [])

  if (phase === 'gone') return null
  const out = phase === 'out'
  const filled = phase === 'fill' || out
  const R = '46vmax'

  const half = (side: 'l' | 'r'): React.CSSProperties => ({
    position: 'absolute', top: 0, bottom: 0, width: '50.2%',
    [side === 'l' ? 'left' : 'right']: 0,
    background: '#001529',
    transform: out ? `translateX(${side === 'l' ? '-101%' : '101%'})` : 'translateX(0)',
    transition: `transform 0.95s ${EASE}`,
  })

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes introRing { 0% { transform: translateX(-50%) scale(0.55); opacity: 0.55 } 100% { transform: translateX(-50%) scale(1.5); opacity: 0 } }
      `}</style>

      {/* the two doors */}
      <div style={half('l')} />
      <div style={half('r')} />

      {/* everything that sits on the doors fades out just before they open */}
      <div className="absolute inset-0" style={{ opacity: out ? 0 : 1, transition: 'opacity 0.45s ease' }}>
        {/* rings spreading out of the dome */}
        {phase !== 'start' && [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute bottom-0 start-1/2 border-2 border-burgundy-300/60"
            style={{
              left: '50%', width: `calc(${R} * 2)`, height: R, borderRadius: `${R} ${R} 0 0`, borderBottom: 0,
              transformOrigin: 'bottom center',
              animation: `introRing 2.4s ease-out ${0.5 + i * 0.5}s infinite`,
              opacity: 0,
            }}
          />
        ))}

        {/* the dome */}
        <div
          className="absolute bottom-0 bg-burgundy-500"
          style={{
            left: '50%', width: `calc(${R} * 2)`, height: R, borderRadius: `${R} ${R} 0 0`,
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) translateY(${phase === 'start' ? '102%' : '0'}) scale(${filled ? 2.6 : 1})`,
            transition: filled
              ? `transform 1.1s ${EASE}`
              : `transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />

        {/* the name */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white"
          style={{
            opacity: filled ? 1 : 0,
            transform: filled ? 'translateY(0)' : 'translateY(26px)',
            transition: 'opacity 0.8s ease 0.35s, transform 0.8s ease 0.35s',
          }}
        >
          <p className="text-5xl sm:text-7xl font-bold">{title}</p>
          <span className="block h-px w-16 bg-white/50 my-5" />
          <p className="text-base sm:text-xl font-light text-burgundy-100 max-w-md">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
