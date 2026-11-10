'use client'

import type { ReactNode } from 'react'
import { useInView } from './useInView'

/** Fades and lifts its content in when it scrolls into view (Shmili-style reveal). */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12)
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
      }}
    >
      {children}
    </div>
  )
}
