'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getT } from '@/lib/i18n/translations'

interface LockIndicatorProps {
  lockedAt: Date | null
  lockedBy?: string
  locale?: string
  /** True when the current user owns this lock (or is admin). */
  canUnlock?: boolean
  onLock?: () => void
  onUnlock?: () => void
}

const LOCK_DURATION = 48 * 60 * 60 * 1000

function getRemainingMs(lockedAt: Date): number {
  return Math.max(0, lockedAt.getTime() + LOCK_DURATION - Date.now())
}

function formatRemaining(ms: number, locale: string): string {
  const hours   = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return locale === 'he' ? `${hours} שעות ו-${minutes} דקות` : `${hours}h ${minutes}m`
}

export function LockIndicator({
  lockedAt, lockedBy, locale = 'he', canUnlock = true, onLock, onUnlock,
}: LockIndicatorProps) {
  const [remaining, setRemaining] = useState<number>(
    lockedAt ? getRemainingMs(lockedAt) : 0,
  )

  useEffect(() => {
    if (!lockedAt) { setRemaining(0); return }
    const id = setInterval(() => setRemaining(getRemainingMs(lockedAt)), 30_000)
    setRemaining(getRemainingMs(lockedAt))
    return () => clearInterval(id)
  }, [lockedAt])

  const T = getT(locale)
  const isLocked  = lockedAt !== null
  const isExpired = isLocked && remaining === 0
  const isActive  = isLocked && !isExpired

  return (
    <div className="flex flex-col gap-2">

      {isActive && (
        <div className={cn(
          'flex items-start gap-2.5 rounded-xl px-4 py-3',
          canUnlock ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200',
        )}>
          <svg
            className={cn('w-5 h-5 shrink-0 mt-0.5', canUnlock ? 'text-orange-500' : 'text-red-500')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>

          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', canUnlock ? 'text-orange-700' : 'text-red-700')}>
              {canUnlock
                ? T.lock.lockedByYou
                : (locale === 'he'
                    ? `נעול על ידי ${lockedBy ?? 'שדכן אחר'}`
                    : `Locked by ${lockedBy ?? 'another matchmaker'}`)}
            </p>
            <p className={cn('text-xs mt-0.5', canUnlock ? 'text-orange-600' : 'text-red-500')}>
              {locale === 'he'
                ? `${formatRemaining(remaining, locale)} נותרו`
                : `${formatRemaining(remaining, locale)} remaining`}
            </p>
            {!canUnlock && (
              <p className="text-xs text-red-400 mt-1">{T.lock.onlyAdminRelease}</p>
            )}
          </div>

          {canUnlock && onUnlock && (
            <button
              type="button"
              onClick={onUnlock}
              className="shrink-0 text-xs font-medium text-orange-600 hover:text-red-600 border border-orange-300 hover:border-red-300 rounded-lg px-2.5 py-1 transition-colors"
            >
              {T.lock.unlock}
            </button>
          )}
        </div>
      )}

      {isExpired && (
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">{T.lock.expired}</p>
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
          {T.lock.lock48}
        </button>
      )}
    </div>
  )
}
