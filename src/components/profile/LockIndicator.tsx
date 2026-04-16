'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface LockIndicatorProps {
  lockedAt: Date | null
  lockedBy?: string
  locale?: string
  onLock?: () => void
}

function getRemainingMs(lockedAt: Date): number {
  const LOCK_DURATION = 48 * 60 * 60 * 1000 // 48 hours
  return Math.max(0, lockedAt.getTime() + LOCK_DURATION - Date.now())
}

function formatRemaining(ms: number, locale: string): string {
  const hours   = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (locale === 'he') return `${hours} שעות ו-${minutes} דקות`
  return `${hours}h ${minutes}m`
}

export function LockIndicator({ lockedAt, lockedBy, locale = 'he', onLock }: LockIndicatorProps) {
  const [remaining, setRemaining] = useState<number>(
    lockedAt ? getRemainingMs(lockedAt) : 0
  )

  useEffect(() => {
    if (!lockedAt) return
    const interval = setInterval(() => {
      setRemaining(getRemainingMs(lockedAt))
    }, 30_000)
    setRemaining(getRemainingMs(lockedAt))
    return () => clearInterval(interval)
  }, [lockedAt])

  const isLocked = lockedAt !== null
  const isExpired = isLocked && remaining === 0

  return (
    <div className="flex flex-col gap-2">
      {isLocked && !isExpired && (
        <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-orange-700 font-semibold text-sm">
              {locale === 'he' ? 'מוקפא' : 'Locked'}
            </p>
            <p className="text-orange-600 text-xs">
              {locale === 'he'
                ? `${formatRemaining(remaining, locale)} נותרו`
                : `${formatRemaining(remaining, locale)} remaining`}
              {lockedBy && ` · ${lockedBy}`}
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">
            {locale === 'he' ? 'פג תוקף הנעילה' : 'Lock expired'}
          </p>
        </div>
      )}

      {!isLocked && onLock && (
        <button
          type="button"
          onClick={onLock}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border border-navy-300',
            'text-navy-600 text-sm font-medium hover:bg-navy-50 transition-colors duration-150',
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {locale === 'he' ? 'נעל 48 שעות' : 'Lock 48h'}
        </button>
      )}
    </div>
  )
}
