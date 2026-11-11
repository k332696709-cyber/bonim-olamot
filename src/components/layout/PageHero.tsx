import type { ReactNode } from 'react'

/**
 * Dark page header used by inner pages (Shmili look): blueprint grid, soft glowing orbs,
 * badge, large title and optional actions. Sits under the floating header pill.
 */
export function PageHero({
  title,
  subtitle,
  badge,
  back,
  children,
  align = 'center',
  chips,
  className = '',
}: {
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  back?: ReactNode
  children?: ReactNode
  align?: 'center' | 'start'
  /** Short labels that drift around the header (decorative, hidden on small screens). */
  chips?: string[]
  className?: string
}) {
  const center = align === 'center'
  return (
    <div className={`hero-dark relative overflow-hidden text-white px-4 pt-14 pb-20 sm:pt-16 sm:pb-24 ${className}`}>
      <div className="absolute -top-20 start-[-6rem] w-80 h-80 rounded-full bg-navy-400/25 blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute -bottom-24 end-[-5rem] w-72 h-72 rounded-full bg-burgundy-400/25 blur-3xl animate-float" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-burgundy-300 to-transparent animate-sweep" />
      </div>
      {chips?.map((c, i) => (
        <span
          key={c}
          aria-hidden="true"
          className="hidden md:inline-flex absolute rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-2 text-xs text-white animate-drift"
          style={{
            top: `${18 + ((i * 29) % 56)}%`,
            insetInlineStart: i % 2 === 0 ? `${4 + i * 3}%` : undefined,
            insetInlineEnd: i % 2 === 1 ? `${4 + i * 3}%` : undefined,
            animationDelay: `${i * -2.3}s`,
          }}
        >
          {c}
        </span>
      ))}
      <div className={`relative max-w-4xl mx-auto animate-fade-up ${center ? 'text-center' : 'text-start'}`}>
        {back && <div className="mb-4 text-sm text-navy-100">{back}</div>}
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-1.5 text-sm text-burgundy-100 mb-5">
            <span className="w-2 h-2 rounded-full bg-burgundy-300" />
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className={`text-navy-100 text-base sm:text-lg mt-4 max-w-2xl ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
        {children && <div className={`mt-6 flex flex-wrap items-center gap-3 ${center ? 'justify-center' : ''}`}>{children}</div>}
      </div>
    </div>
  )
}
