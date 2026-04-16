'use client'

import { cn } from '@/lib/utils'
import type { MatchmakerStatus } from '@/types/registration'

interface TrafficLightProps {
  status: MatchmakerStatus
  locale?: string
  compact?: boolean
  onChange?: (status: MatchmakerStatus) => void
}

const STATUS_CONFIG: Record<MatchmakerStatus, {
  color: string
  he: string
  en: string
  bg: string
  border: string
  text: string
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

export function TrafficLight({ status, locale = 'he', compact = false, onChange }: TrafficLightProps) {
  const cfg = STATUS_CONFIG[status]
  const label = locale === 'he' ? cfg.he : cfg.en

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

      {/* Status switcher (if onChange provided) */}
      {onChange && (
        <div className="flex gap-2">
          {STATUSES.map((s) => {
            const c = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                title={locale === 'he' ? c.he : c.en}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all duration-150',
                  status === s
                    ? 'scale-125 border-gray-600'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
                style={{ backgroundColor: c.color }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
