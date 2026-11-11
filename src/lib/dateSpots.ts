import type { DateSpot, PriceRange, SpotCategory, SpotRegion } from '@/types/dateSpots'

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
    return spots.sort((a, b) => Number(!!b.sponsored) - Number(!!a.sponsored) || a.name.localeCompare(b.name, 'he'))
  } catch {
    return []
  }
}
