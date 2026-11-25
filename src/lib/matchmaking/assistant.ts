import type { FemaleProfile, MaleProfile } from '@/types/registration'
import { calculateCompatibility } from './compatibilityEngine'
import { TRAIT_OPTIONS_FEMALE, TRAIT_OPTIONS_MALE } from '@/constants/formOptions'
import { GROUP_LABELS, groupsMentioned, groupsOf } from './preferences'

export type AnyProfile = MaleProfile | FemaleProfile

/** The assistant offers only proposals at or above this match percentage. */
export const MIN_MATCH_SCORE = 88

/** What the candidate is allowed to see about a proposal: no surname, phone or email. */
export interface Proposal {
  id: string
  initial: string
  /** First and last name (shown to other candidates in proposals). */
  name: string
  gender: 'male' | 'female'
  age: number
  city: string
  community: string
  /** The edah, for filtering by origin (empty when unknown). */
  origin?: string
  occupation: string
  style: string
  traits: string[]
  score: number
  highlightsHe: string[]
  highlightsEn: string[]
  conflictsHe: string[]
  conflictsEn: string[]
  /** Filled in on the server: the person is in the middle of a match with someone else. */
  busy?: boolean
}

export type StyleShift = 'more_open' | 'more_conservative' | null

export interface Prefs {
  city?: string | null
  minAge?: number | null
  maxAge?: number | null
  styleShift?: StyleShift
  /** Origin or community wanted, as group ids (for example "ashkenazi"). */
  groups?: string[] | null
  /** Origin or community not wanted. */
  notGroups?: string[] | null
}

export const isMale = (p: AnyProfile): p is MaleProfile =>
  (p as any).gender ? (p as any).gender === 'male' : !('headcovering' in p)

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
        name: `${other.firstName ?? ''} ${other.lastName ?? ''}`.trim(),
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
      const theirs = groupsOf(`${p.community ?? ''} ${p.origin ?? ''}`)
      if (theirs.size === 0) return true // nothing known about them: do not guess
      if (prefs.notGroups?.some((g) => theirs.has(g))) return false
      if (prefs.groups && prefs.groups.length > 0 && !prefs.groups.some((g) => theirs.has(g))) return false
      return true
    })
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

  // Origin or community: "אשכנזיה", "לא חסידית".
  const mentioned = groupsMentioned(text)
  if (mentioned.wanted.size > 0) prefs.groups = Array.from(mentioned.wanted)
  if (mentioned.rejected.size > 0) prefs.notGroups = Array.from(mentioned.rejected)

  if (/פתוח|מודרני|open|modern/.test(t)) prefs.styleShift = 'more_open'
  if (/שמור|ישיבתי|חרדי יותר|conservative|traditional|yeshivish/.test(t)) prefs.styleShift = 'more_conservative'

  if (/הכל|איפוס|reset|clear|show all/.test(t)) {
    return { city: null, minAge: null, maxAge: null, styleShift: null, groups: null, notGroups: null }
  }
  return prefs
}

export function describePrefs(prefs: Prefs, he: boolean): string {
  const parts: string[] = []
  if (prefs.city) parts.push(he ? `עיר: ${prefs.city}` : `City: ${prefs.city}`)
  if (prefs.minAge) parts.push(he ? `מגיל ${prefs.minAge}` : `from ${prefs.minAge}`)
  if (prefs.maxAge) parts.push(he ? `עד גיל ${prefs.maxAge}` : `up to ${prefs.maxAge}`)
  if (prefs.groups?.length) parts.push((he ? 'מוצא או קהילה: ' : 'Origin: ') + prefs.groups.map((g) => GROUP_LABELS[g] ?? g).join(', '))
  if (prefs.notGroups?.length) parts.push((he ? 'ללא: ' : 'Not: ') + prefs.notGroups.map((g) => GROUP_LABELS[g] ?? g).join(', '))
  if (prefs.styleShift === 'more_open') parts.push(he ? 'סגנון פתוח יותר' : 'more open style')
  if (prefs.styleShift === 'more_conservative') parts.push(he ? 'סגנון שמור יותר' : 'more conservative style')
  return parts.join(' · ')
}

/** The engine's Hebrew highlights list raw trait keys ("calm, communicative"); show Hebrew words. */
function localizeTraits(text: string): string {
  const all = TRAIT_OPTIONS_MALE.concat(TRAIT_OPTIONS_FEMALE)
  return text.replace(/\b[a-z]+\b/g, (w) => all.find((o) => o.value === w)?.he ?? w)
}
