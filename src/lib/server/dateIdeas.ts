/* eslint-disable */
// Server-only: date places for two people who are both interested, by their cities of residence.
import { cityCoords, distanceKm } from '@/constants/cityCoords'

export interface IdeaSpot {
  id: string
  name: string
  city: string
  category: string
  vibe: string
  googleMapsUrl: string | null
  kmFromMe: number
  kmFromThem: number
}

export interface DateIdeas {
  myCity: string
  theirCity: string
  theirGender: 'male' | 'female'
  /** True when the two live very close, so a place in either city works. */
  veryClose: boolean
  distanceBetween: number | null
  nearMe: IdeaSpot[]
  nearThem: IdeaSpot[]
  middle: IdeaSpot[]
  located: boolean
}

const TOP = 5
const VERY_CLOSE_KM = 12

export async function loadDateIdeas(admin: any, myProfileId: string, targetId: string): Promise<DateIdeas | 'not_mutual' | null> {
  const { data: ints } = await admin
    .from('match_interests').select('from_profile_id')
    .or(`and(from_profile_id.eq.${myProfileId},to_profile_id.eq.${targetId}),and(from_profile_id.eq.${targetId},to_profile_id.eq.${myProfileId})`)
    .eq('kind', 'interested')
  if ((ints ?? []).length < 2) return 'not_mutual'

  const { data: rows } = await admin.from('profiles').select('id, gender, city').in('id', [myProfileId, targetId])
  const me = (rows ?? []).find((r: any) => r.id === myProfileId)
  const them = (rows ?? []).find((r: any) => r.id === targetId)
  if (!me || !them || me.gender === them.gender) return null

  const a = cityCoords(me.city)
  const b = cityCoords(them.city)

  const { data: spotRows } = await admin
    .from('date_spots').select('id, name, city, category, vibe, google_maps_url, kosher').eq('is_published', true)
  const spots = (spotRows ?? []).filter((s: any) => s.kosher !== false)

  const base: DateIdeas = {
    myCity: me.city ?? '', theirCity: them.city ?? '', theirGender: them.gender,
    veryClose: false, distanceBetween: null, nearMe: [], nearThem: [], middle: [], located: !!(a && b),
  }
  if (!a || !b) return base

  const placed: IdeaSpot[] = []
  for (const s of spots) {
    const c = cityCoords(s.city)
    if (!c) continue
    placed.push({
      id: s.id, name: s.name, city: s.city, category: s.category, vibe: s.vibe ?? '', googleMapsUrl: s.google_maps_url ?? null,
      kmFromMe: Math.round(distanceKm(a, c)), kmFromThem: Math.round(distanceKm(b, c)),
    })
  }

  const between = distanceKm(a, b)
  const nearMe = placed.slice().sort((x, y) => x.kmFromMe - y.kmFromMe).slice(0, TOP)
  const nearThem = placed.slice().sort((x, y) => x.kmFromThem - y.kmFromThem).slice(0, TOP)
  // In the middle: the place where the longer of the two trips is as short as possible, and the
  // two trips are as equal as possible.
  const middle = between <= VERY_CLOSE_KM
    ? []
    : placed
        .slice()
        .sort((x, y) => Math.max(x.kmFromMe, x.kmFromThem) - Math.max(y.kmFromMe, y.kmFromThem)
          || Math.abs(x.kmFromMe - x.kmFromThem) - Math.abs(y.kmFromMe - y.kmFromThem))
        .slice(0, TOP)

  return { ...base, veryClose: between <= VERY_CLOSE_KM, distanceBetween: Math.round(between), nearMe, nearThem, middle }
}
