// ─── Date Spot Types ──────────────────────────────────────────────────────────
// Structured for easy Supabase / DB connection later.
// Replace mockData with real API calls when backend is ready.

export type SpotCategory = 'restaurant' | 'hotel_lobby' | 'park' | 'quiet'
export type SpotRegion   = 'jerusalem' | 'center' | 'north' | 'south'
export type PriceRange   = '\u20aa' | '\u20aa\u20aa' | '\u20aa\u20aa\u20aa'

export interface SpotReview {
  id: string
  authorName: string   // display name only — no PII stored here
  rating: number       // 1–5
  text: string
  createdAt: string    // ISO date string
}

export interface DateSpot {
  id: string
  name: string
  city: string
  region: SpotRegion
  category: SpotCategory
  vibe: string           // short Hebrew description of the atmosphere
  address?: string
  googleMapsUrl?: string
  kosher?: boolean
  priceRange?: PriceRange
  averageRating: number  // pre-computed average (1–5)
  reviewCount: number
  reviews: SpotReview[]
}

// ─── Category / Region label maps ────────────────────────────────────────────

export const CATEGORY_LABELS: Record<SpotCategory, { he: string; emoji: string }> = {
  restaurant:  { he: 'מסעדות',              emoji: '🍽️' },
  hotel_lobby: { he: 'בתי מלון / לובי',    emoji: '🏨' },
  park:        { he: 'פארקים וטבע',         emoji: '🌳' },
  quiet:       { he: 'מקומות שקטים',        emoji: '🕊️' },
}

export const REGION_LABELS: Record<SpotRegion, string> = {
  jerusalem: 'ירושלים',
  center:    'מרכז',
  north:     'צפון',
  south:     'דרום',
}
