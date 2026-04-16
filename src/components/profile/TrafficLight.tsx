'use client'

import { cn } from '@/lib/utils'
import type { MatchmakerStatus } from '@/types/registration'

interface TrafficLightProps {
  status: MatchmakerStatus
  locale?: string
  compact?: boolean
  onChange?: (status: MatchmakerStatus) => void
  /**
   * When false, the status switcher buttons are shown but disabled.
   * Used to prevent non-owners from changing a Green (Active Match) status.
   */
  canChange?: boolean
  /** Name of the matchmaker who owns this lock — used in the lock tooltip. */
  lockedBy?: string
}

const STATUS_CONFIG: Record<MatchmakerStatus, {
  color: string; he: string; en: string; bg: string; border: string; text: string
}> = {
  green: {
    color: '#22c55e',
    he: 'שידוך פעיל',
    en: 'Active Match',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
  },
  orange: {
    color: '#f97316',
    he: 'הצעה אחרונה השבוע',
    en: 'Offer This Week',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
  },
  light_red: {
    color: '#f87171',
    he: 'חודש ללא הצעות',
    en: '~1 Month No Offer',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-400',
  },
  bright_red: {
    color: '#dc2626',
    he: 'יותר מחודשיים',
    en: '2+ Months No Offer',
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-700',
  },
}

const STATUSES: MatchmakerStatus[] = ['green', 'orange', 'light_red', 'bright_red']

export function TrafficLight({
  status, locale = 'he', compact = false,
  onChange, canChange = true, lockedBy,
}: TrafficLightProps) {
  const t = locale === 'he'
  const cfg = STATUS_CONFIG[status]
  const label = t ? cfg.he : cfg.en

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}88` }}
        />
        <span className={cn('text-xs font-medium', cfg.text)}>{label}</span>
      </div>
    )
  }

  const lockTooltip = t
    ? `פרופיל זה בשידוך פעיל. רק ${lockedBy ?? 'השדכן'} או מנהל יכול לשנות את הסטטוס.`
    : `Profile is in an active match. Only ${lockedBy ?? 'the assigned matchmaker'} or an admin can change this status.`

  return (
    <div className="flex flex-col gap-3">
      {/* Current status badge */}
      <div className={cn('inline-flex items-center gap-2.5 px-4 py-2 rounded-full border', cfg.bg, cfg.border)}>
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
          style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}66` }}
        />
        <span className={cn('font-semibold text-sm', cfg.text)}>{label}</span>
      </div>

      {/* Status switcher */}
      {onChange && (
        <div className="relative group/lock">
          <div className={cn('flex gap-2', !canChange && 'opacity-40')}>
            {STATUSES.map((s) => {
              const c = STATUS_CONFIG[s]
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!canChange}
                  onClick={canChange ? () => onChange(s) : undefined}
                  title={t ? c.he : c.en}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all duration-150',
                    status === s
                      ? 'scale-125 border-gray-600'
                      : 'border-transparent opacity-60',
                    canChange
                      ? 'hover:opacity-100 cursor-pointer'
                      : 'cursor-not-allowed',
                  )}
                  style={{ backgroundColor: c.color }}
                />
              )
            })}
          </div>

          {/* Lock tooltip shown on hover when canChange = false */}
          {!canChange && (
            <div className="absolute bottom-full mb-2 start-0 hidden group-hover/lock:flex z-20
                            w-64 bg-gray-900 text-white text-xs rounded-xl px-3.5 py-2.5
                            shadow-xl pointer-events-none flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-semibold">{t ? 'שינוי חסום' : 'Change blocked'}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{lockTooltip}</p>
              {/* Arrow */}
              <div className="absolute top-full start-4 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
