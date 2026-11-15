import type { DateSpot, DateStage, PriceRange, SpotCategory, SpotRegion } from '@/types/dateSpots'

/** A row of the date_spots table. */
export interface DateSpotRow {
  id: string
  name: string
  city: string
  region: SpotRegion
  category: SpotCategory
  vibe: string
  address: string | null
  google_maps_url: string | null
  website_url: string | null
  phone: string | null
  kosher: boolean | null
  price_range: PriceRange | null
  suitable_dates: DateStage[] | null
  is_published: boolean
  is_sponsored: boolean
  sponsor_until: string | null
  admin_notes: string | null
  created_at: string
}

export function rowToSpot(r: DateSpotRow): DateSpot {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    region: r.region,
    category: r.category,
    vibe: r.vibe,
    address: r.address ?? undefined,
    googleMapsUrl: r.google_maps_url ?? undefined,
    websiteUrl: r.website_url ?? undefined,
    phone: r.phone ?? undefined,
    kosher: r.kosher ?? undefined,
    suitableDates: r.suitable_dates ?? [],
    priceRange: r.price_range ?? undefined,
    sponsored: r.is_sponsored && (!r.sponsor_until || new Date(r.sponsor_until) >= new Date(new Date().toDateString())),
    averageRating: 0,
    reviewCount: 0,
    reviews: [],
  }
}

/** Published spots for the public pages: active partners first, then the rest by name. */
export async function fetchPublishedSpots(): Promise<DateSpot[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { data, error } = await (createClient() as any)
      .from('date_spots')
      .select('*')
      .eq('is_published', true)
    if (error || !data) return []
    const spots = (data as DateSpotRow[]).map(rowToSpot)

    // Saved reviews are read with the server key: the browser has no direct access to the table,
    // because it also records who wrote each review.
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (url && key && spots.length > 0) {
        const { createClient: createAdmin } = await import('@supabase/supabase-js')
        const admin = createAdmin(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) as any
        const { data: revs } = await admin
          .from('date_spot_reviews')
          .select('id, spot_id, rating, comment, author_label, created_at')
          .in('spot_id', spots.map((s) => s.id))
          .order('created_at', { ascending: false })
        const bySpot = new Map<string, any[]>()
        for (const r of revs ?? []) {
          const list = bySpot.get(r.spot_id) ?? []
          list.push({ id: r.id, authorName: r.author_label || 'מועמד', rating: r.rating, text: r.comment ?? '', createdAt: String(r.created_at).slice(0, 10) })
          bySpot.set(r.spot_id, list)
        }
        for (const s of spots) {
          const list = bySpot.get(s.id) ?? []
          s.reviews = list
          s.reviewCount = list.length
          s.averageRating = list.length ? Math.round((list.reduce((a, r) => a + r.rating, 0) / list.length) * 10) / 10 : 0
        }
      }
    } catch { /* the places are still shown without reviews */ }

    return spots.sort((a, b) => Number(!!b.sponsored) - Number(!!a.sponsored) || a.name.localeCompare(b.name, 'he'))
  } catch {
    return []
  }
}
