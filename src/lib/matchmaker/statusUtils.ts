import type { FemaleProfile, MaleProfile, MatchmakerStatus } from '@/types/registration'

const LOCK_MS       = 48 * 60 * 60 * 1000
const DAY_MS        = 24 * 60 * 60 * 1000
const WEEK_CUTOFF   = 7
const MONTH_CUTOFF  = 60 // 2 months

/**
 * Derives the display status from profile dates.
 * Overrides the stored matchmakerStatus with the live-computed value.
 */
export function computeStatus(profile: FemaleProfile | MaleProfile): MatchmakerStatus {
  // Active lock → green
  if (profile.lockedAt !== null) {
    const expiry = new Date(profile.lockedAt).getTime() + LOCK_MS
    if (Date.now() < expiry) return 'green'
  }

  if (!profile.lastOfferDate) return 'bright_red'

  const days = Math.floor((Date.now() - new Date(profile.lastOfferDate).getTime()) / DAY_MS)

  if (days <= WEEK_CUTOFF)  return 'orange'
  if (days <= MONTH_CUTOFF) return 'light_red'
  return 'bright_red'
}

/** Returns how many ms remain in a 48-hour lock, or 0 if unlocked/expired. */
export function lockRemainingMs(lockedAt: Date | null): number {
  if (!lockedAt) return 0
  return Math.max(0, new Date(lockedAt).getTime() + LOCK_MS - Date.now())
}

/** Human-readable "last offer" relative date string. */
export function formatLastOffer(date: Date | null | undefined, locale: string): string {
  if (!date) return locale === 'he' ? 'אין הצעות' : 'No offers'

  const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS)

  if (locale === 'he') {
    if (days === 0) return 'היום'
    if (days === 1) return 'אתמול'
    if (days < 7)  return `לפני ${days} ימים`
    if (days < 14) return 'לפני שבוע'
    if (days < 30) return `לפני ${Math.floor(days / 7)} שבועות`
    if (days < 60) return 'לפני חודש'
    return `לפני ${Math.floor(days / 30)} חודשים`
  }

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return '1 month ago'
  return `${Math.floor(days / 30)} months ago`
}
