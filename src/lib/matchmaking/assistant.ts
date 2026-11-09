import type { FemaleProfile, MaleProfile } from '@/types/registration'
import { calculateCompatibility } from './compatibilityEngine'
import { TRAIT_OPTIONS_FEMALE, TRAIT_OPTIONS_MALE } from '@/constants/formOptions'

export type AnyProfile = MaleProfile | FemaleProfile

/** What the candidate is allowed to see about a proposal: no surname, phone or email. */
export interface Proposal {
  id: string
  initial: string
  gender: 'male' | 'female'
  age: number
  city: string
  community: string
  occupation: string
  style: string
  traits: string[]
  score: number
  highlightsHe: string[]
  highlightsEn: string[]
  conflictsHe: string[]
  conflictsEn: string[]
}

export type StyleShift = 'more_open' | 'more_conservative' | null

export interface Prefs {
  city?: string | null
  minAge?: number | null
  maxAge?: number | null
  styleShift?: StyleShift
}

export const isMale = (p: AnyProfile): p is MaleProfile => !('headcovering' in p)

const STYLE_RANK: Record<string, number> = {
  yeshivish: 1, shmura: 1, open_ish: 2, open: 3, modern: 4, very_modern: 5,
}

export function styleRank(style: string): number {
  return STYLE_RANK[style] ?? 3
}

/** Rank every profile of the opposite gender by the existing compatibility engine. */
export function buildProposals(me: AnyProfile, pool: AnyProfile[]): Proposal[] {
  const meIsMale = isMale(me)
  return pool
    .filter((p) => isMale(p) !== meIsMale)
    .map((other) => {
      const r = meIsMale
        ? calculateCompatibility(me as MaleProfile, other as FemaleProfile)
        : calculateCompatibility(other as MaleProfile, me as FemaleProfile)
      return {
        id: other.id,
        initial: other.firstName.charAt(0),
        gender: isMale(other) ? 'male' : 'female',
        age: other.age,
        city: other.city,
        community: other.community,
        occupation: other.occupation,
        style: other.style,
        traits: other.traits as string[],
        score: Math.round(r.score),
        highlightsHe: r.highlightsHe.slice(0, 3).map(localizeTraits),
        highlightsEn: r.highlights.slice(0, 3),
        conflictsHe: r.conflicts.map((c) => c.he).slice(0, 2),
        conflictsEn: r.conflicts.map((c) => c.en).slice(0, 2),
      } satisfies Proposal
    })
    .sort((a, b) => b.score - a.score)
}

/** Apply the preferences the assistant extracted from the conversation. */
export function applyPrefs(list: Proposal[], prefs: Prefs, mine: AnyProfile): Proposal[] {
  const myRank = styleRank(mine.style)
  return list
    .filter((p) => !prefs.city || p.city.includes(prefs.city))
    .filter((p) => prefs.minAge == null || p.age >= prefs.minAge)
    .filter((p) => prefs.maxAge == null || p.age <= prefs.maxAge)
    .filter((p) => {
      if (prefs.styleShift === 'more_open') return styleRank(p.style) >= myRank
      if (prefs.styleShift === 'more_conservative') return styleRank(p.style) <= myRank
      return true
    })
}

/** Rule-based reading of a free-text request. Also the fallback when no AI key is set. */
export function parseLocal(text: string, cities: string[]): Prefs {
  const t = text.toLowerCase()
  const prefs: Prefs = {}

  const city = cities.find((c) => t.includes(c.toLowerCase()))
  if (city) prefs.city = city

  const max = t.match(/(?:עד|מתחת ל|under|up to|max)\s*(?:גיל\s*)?(\d{2})/)
  if (max) prefs.maxAge = Number(max[1])
  const min = t.match(/(?:מעל|לפחות|from|over|min)\s*(?:גיל\s*)?(\d{2})/)
  if (min) prefs.minAge = Number(min[1])

  if (/פתוח|מודרני|open|modern/.test(t)) prefs.styleShift = 'more_open'
  if (/שמור|ישיבתי|חרדי יותר|conservative|traditional|yeshivish/.test(t)) prefs.styleShift = 'more_conservative'

  if (/הכל|איפוס|reset|clear|show all/.test(t)) {
    return { city: null, minAge: null, maxAge: null, styleShift: null }
  }
  return prefs
}

export function describePrefs(prefs: Prefs, he: boolean): string {
  const parts: string[] = []
  if (prefs.city) parts.push(he ? `עיר: ${prefs.city}` : `City: ${prefs.city}`)
  if (prefs.minAge) parts.push(he ? `מגיל ${prefs.minAge}` : `from ${prefs.minAge}`)
  if (prefs.maxAge) parts.push(he ? `עד גיל ${prefs.maxAge}` : `up to ${prefs.maxAge}`)
  if (prefs.styleShift === 'more_open') parts.push(he ? 'סגנון פתוח יותר' : 'more open style')
  if (prefs.styleShift === 'more_conservative') parts.push(he ? 'סגנון שמור יותר' : 'more conservative style')
  return parts.join(' · ')
}

/** The engine's Hebrew highlights list raw trait keys ("calm, communicative"); show Hebrew words. */
function localizeTraits(text: string): string {
  const all = TRAIT_OPTIONS_MALE.concat(TRAIT_OPTIONS_FEMALE)
  return text.replace(/\b[a-z]+\b/g, (w) => all.find((o) => o.value === w)?.he ?? w)
}
