'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from './useInView'

type Phase = 'in' | 'hold' | 'out' | 'gone'

/**
 * The opening animation of the home page, on every visit: a burgundy circle grows from the
 * middle until it fills the screen, the name shows for a moment, then the whole curtain slides
 * up and away.
 */
export function IntroSplash({ title, subtitle }: { title: string; subtitle: string }) {
  const [phase, setPhase] = useState<Phase>('in')

  useEffect(() => {
    if (prefersReducedMotion()) { setPhase('gone'); return }
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setPhase('hold'), 60)
    const t2 = setTimeout(() => setPhase('out'), 1900)
    const t3 = setTimeout(() => { setPhase('gone'); document.body.style.overflow = '' }, 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); document.body.style.overflow = '' }
  }, [])

  if (phase === 'gone') return null
  const out = phase === 'out'

  return (
    <div
      className="fixed inset-0 z-[100] bg-navy-800 flex items-center justify-center overflow-hidden"
      style={{
        transform: out ? 'translateY(-100%)' : 'translateY(0)',
        borderRadius: out ? '0 0 50% 50% / 0 0 14% 14%' : '0',
        transition: 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1), border-radius 0.85s cubic-bezier(0.76, 0, 0.24, 1)',
      }}
      aria-hidden="true"
    >
      <div
        className="absolute rounded-full bg-burgundy-500"
        style={{
          width: '60vmax', height: '60vmax',
          transform: phase === 'in' ? 'scale(0)' : 'scale(1)',
          transition: 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <div
        className="relative text-center px-6 text-white"
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'translateY(24px)' : 'translateY(0)',
          transition: 'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s',
        }}
      >
        <p className="text-5xl sm:text-7xl font-bold">{title}</p>
        <p className="mt-3 text-base sm:text-xl font-light text-burgundy-100">{subtitle}</p>
      </div>
    </div>
  )
}
