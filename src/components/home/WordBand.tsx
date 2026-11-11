'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from './useInView'

/**
 * The red strip under the hero. The moment it scrolls into view the words pop in one after
 * another, then a highlight keeps hopping from word to word.
 */
export function WordBand({ words }: { words: string[] }) {
  const [active, setActive] = useState(-1)
  const { ref, inView } = useInView<HTMLDivElement>(0.4)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    let i = 0
    const start = setTimeout(() => setActive(0), 700)
    const tick = setInterval(() => {
      i = (i + 1) % words.length
      setActive(i)
    }, 1300)
    return () => { clearTimeout(start); clearInterval(tick) }
  }, [words.length, inView])

  return (
    <div ref={ref} className="bg-burgundy-500 text-white py-5 sm:py-7 select-none overflow-hidden" aria-hidden="true">
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-7 sm:gap-x-14 gap-y-3">
        {words.map((w, i) => {
          const on = active === i
          return (
            <span key={w} className={`flex items-center gap-5 sm:gap-10 ${inView ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 110}ms`, animationDuration: '0.6s' }}>
              <span
                className="relative text-xl sm:text-4xl font-medium transition-all duration-500 ease-out"
                style={{
                  opacity: active === -1 || on ? 1 : 0.55,
                  transform: on ? 'translateY(-3px) scale(1.12)' : 'translateY(0) scale(1)',
                }}
              >
                {w}
                <span
                  className="absolute -bottom-1.5 inset-x-0 h-0.5 rounded-full bg-white origin-center transition-transform duration-500"
                  style={{ transform: on ? 'scaleX(1)' : 'scaleX(0)' }}
                />
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
