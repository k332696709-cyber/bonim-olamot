// ─── Date Spot Types ──────────────────────────────────────────────────────────
// Structured for easy Supabase / DB connection later.
// Replace mockData with real API calls when backend is ready.

export type SpotCategory = 'restaurant' | 'hotel_lobby' | 'park' | 'quiet' | 'other'
export type SpotRegion =
  | 'upper_galilee'
  | 'golan'
  | 'kinneret'
  | 'lower_galilee'
  | 'haifa'
  | 'krayot'
  | 'western_galilee'
  | 'sharon'
  | 'gush_dan'
  | 'shfela'
  | 'samaria'
  | 'jerusalem'
  | 'judea'
  | 'lachish'
  | 'negev'
  | 'dead_sea'
  | 'arava'
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
  websiteUrl?: string
  phone?: string
  /** Paid partner: shown first with a badge. */
  sponsored?: boolean
  kosher?: boolean
  priceRange?: PriceRange
  averageRating: number  // pre-computed average (1–5)
  reviewCount: number
  reviews: SpotReview[]
}

// ─── Category / Region label maps ────────────────────────────────────────────

export const CATEGORY_LABELS: Record<SpotCategory, { he: string; en: string }> = {
  restaurant:  { he: 'מסעדות',           en: 'Restaurants' },
  hotel_lobby: { he: 'בתי מלון / לובי', en: 'Hotel Lobbies' },
  park:        { he: 'פארקים וטבע',      en: 'Parks & Nature' },
  quiet:       { he: 'מקומות שקטים',     en: 'Quiet Spots' },
  other:       { he: 'אחר',              en: 'Other' },
}

export const REGION_LABELS: Record<SpotRegion, { he: string; en: string }> = {
  upper_galilee: { he: 'גליל עליון', en: 'Upper Galilee' },
  golan: { he: 'גולן', en: 'Golan' },
  kinneret: { he: 'כנרת וטבריה', en: 'Kinneret & Tiberias' },
  lower_galilee: { he: 'גליל תחתון והעמקים', en: 'Lower Galilee & Valleys' },
  haifa: { he: 'חיפה והכרמל', en: 'Haifa & Carmel' },
  krayot: { he: 'קריות', en: 'The Krayot' },
  western_galilee: { he: 'עכו, נהריה והגליל המערבי', en: 'Acre, Nahariya & Western Galilee' },
  sharon: { he: 'שרון', en: 'Sharon' },
  gush_dan: { he: 'תל אביב וגוש דן', en: 'Tel Aviv & Gush Dan' },
  shfela: { he: 'שפלה', en: 'Shfela' },
  samaria: { he: 'שומרון ובנימין', en: 'Samaria & Binyamin' },
  jerusalem: { he: 'ירושלים', en: 'Jerusalem' },
  judea: { he: 'הרי יהודה וגוש עציון', en: 'Judean Hills & Gush Etzion' },
  lachish: { he: 'לכיש', en: 'Lachish' },
  negev: { he: 'באר שבע והנגב', en: 'Beer Sheva & Negev' },
  dead_sea: { he: 'ים המלח ומדבר יהודה', en: 'Dead Sea & Judean Desert' },
  arava: { he: 'ערבה ואילת', en: 'Arava & Eilat' },
}

/** Order shown in filters: north to south. */
export const REGION_ORDER = Object.keys(REGION_LABELS) as SpotRegion[]
