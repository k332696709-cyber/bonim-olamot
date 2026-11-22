import type { FemaleProfile, MaleProfile, MatchmakerStatus } from '@/types/registration'

const LOCK_MS       = 48 * 60 * 60 * 1000
const DAY_MS        = 24 * 60 * 60 * 1000
const MONTH_CUTOFF  = 30 // up to a month since the last offer: still green
const TWO_MONTHS    = 60

/**
 * The traffic light, worked out by itself from what happened on the site:
 *  green: in an active match, or got an offer in the last month
 *  orange: no offer for a month
 *  light red: no offer for over two months
 *  bright red: never got an offer
 * The date of the last offer updates when a match is opened for the candidate or a proposal is sent.
 */
export function computeStatus(profile: FemaleProfile | MaleProfile, inActiveMatch = false): MatchmakerStatus {
  if (inActiveMatch) return 'green'

  // A matchmaker working on the profile right now (48 hours) is green too.
  if (profile.lockedAt !== null) {
    const expiry = new Date(profile.lockedAt).getTime() + LOCK_MS
    if (Date.now() < expiry) return 'green'
  }

  if (!profile.lastOfferDate) return 'bright_red'

  const days = Math.floor((Date.now() - new Date(profile.lastOfferDate).getTime()) / DAY_MS)

  if (days <= MONTH_CUTOFF) return 'green'
  if (days <= TWO_MONTHS)   return 'orange'
  return 'light_red'
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
