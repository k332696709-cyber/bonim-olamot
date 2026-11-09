import type {
  Brings, FemaleProfile, MaleProfile, PhoneType, RelationshipValue, Trait,
} from '@/types/registration'
import { setCandidateSession } from './candidateSession'

/**
 * "Registered" state for a candidate, kept in this browser (localStorage) after a
 * successful registration. It unlocks the Smart Assistant and holds the profile the
 * compatibility engine scores against.
 *
 * NOTE: this is client-side only (like the existing candidate session). Real access
 * control needs accounts (e.g. Supabase auth) so the server can check it.
 */

const KEY = 'candidate_registration'
export const REGISTERED_EVENT = 'candidate-registered'

export interface StoredRegistration {
  gender: 'male' | 'female'
  profile: MaleProfile | FemaleProfile
}

// ── Mapping Tally answers -> the enums the compatibility engine understands ─────

const MALE_STYLE: Record<string, MaleProfile['style']> = {
  'שמור ישיבתי': 'yeshivish', 'שמור עובד': 'open_ish', 'פתוח': 'open',
  'פתוח במידה': 'open_ish', 'מודרני': 'modern', 'מודרני מאוד': 'very_modern',
}
const FEMALE_STYLE: Record<string, FemaleProfile['style']> = {
  'שמורה': 'shmura', 'פתוחה': 'open', 'פתוחה במידה': 'open_ish',
  'מודרנית': 'modern', 'מודרנית מאוד': 'very_modern',
}
const MALE_PARTNER_STYLE: Record<string, MaleProfile['partnerStyle']> = {
  'פשוטה/קלאסית': 'closed', 'פתוחה': 'open', 'פתוחה במידה': 'open_ish',
  'מודרנית': 'modern', 'מודרנית מאוד': 'very_modern',
}
const FEMALE_PARTNER_STYLE: Record<string, FemaleProfile['partnerStyle']> = {
  'שמור/ישיבתי': 'shmur', 'שמור/עובד': 'open_ish', 'פתוח': 'open',
  'פתוח במידה': 'open_ish', 'מודרני': 'modern', 'מודרני מאוד': 'very_modern',
}
const PHONE: Record<string, PhoneType> = {
  'פשוט (כשר)': 'kosher', 'מוגן/מסונן': 'filtered', 'לא כשר': 'smartphone',
  'גם כשר וגם מוגן': 'filtered', 'גם כשר וגם לא מוגן': 'work_smartphone',
}
const FEMALE_CLOTHING: Record<string, FemaleProfile['clothing']> = {
  'פשוט': 'simple', 'קלאסי': 'classic', 'עדכני בסטייל': 'stylish',
  'מכובד': 'respectable', 'מודרני': 'modern', 'מודרני מאוד': 'very_modern',
}
const HEADCOVER: Record<string, FemaleProfile['headcovering']> = {
  'פאה טופ לייס/עם תספורת': 'wig_with_cut', 'פאה טופ לייס/ללא תספורת': 'wig_no_cut',
  'רק פאה': 'wig_only', "פאה עם כיסוי (סרט/קשת וכו')": 'wig_plus_cover',
  'רק מטפחת': 'kerchief_only', 'פאה/מטפחת ללא עדיפות': 'no_preference',
}
const MALE_PARTNER_CLOTHING_BY_STYLE: Record<string, MaleProfile['partnerClothing']> = {
  'פשוט': 'very_simple', 'קלאסי': 'simple_updated', 'מכובד': 'simple_updated',
  'עדכני בסטייל': 'modern_modest', 'מודרני': 'very_modern', 'מודרני מאוד': 'very_modern',
}

const TRAIT_WORDS: [string[], Trait][] = [
  [['רגוע', 'רגועה'], 'calm'], [['שמח', 'שמחה'], 'happy'], [['רציני', 'רצינית'], 'serious'],
  [['זורם', 'זורמת'], 'flowing'], [['עמוק', 'עמוקה'], 'deep'], [['חברותי', 'חברותית'], 'social'],
  [['יוזם', 'יוזמת'], 'proactive'], [['ביישן', 'ביישנית'], 'shy'], [['תקשורתי', 'תקשורתית'], 'communicative'],
]
const BRING_WORDS: [string[], Brings][] = [
  [['יציבות'], 'stability'], [['רגשי', 'רגש'], 'emotional'], [['מחויבות', 'מחוייבות'], 'commitment'],
  [['אחריות'], 'responsibility'], [['ביתיות', 'ביתי'], 'homey'], [['עומק'], 'depth'],
  [['קלילות', 'שמחה'], 'lightness'], [['אמינות'], 'reliability'], [['תקשורת'], 'communication'],
]

const pickWords = <T extends string>(text: string, table: [string[], T][]): T[] =>
  table.filter(([words]) => words.some((w) => text.includes(w))).map(([, v]) => v).slice(0, 3)

/** Build an engine profile from the registration answers (unknown parts get neutral defaults). */
export function buildProfile(gender: 'male' | 'female', a: Record<string, string>, id: string): MaleProfile | FemaleProfile {
  const brings = pickWords(a.brings ?? '', BRING_WORDS)
  const valueKeys: string[] = ['stability', 'emotional', 'homey', 'depth', 'lightness']
  const sharedValues = brings.filter((b) => valueKeys.includes(b)) as RelationshipValue[]
  const common = {
    id,
    firstName: (a.fullName ?? '').trim().split(/\s+/)[0] || '—',
    lastName: a.lastName ?? '',
    age: Number(a.age) || 25,
    hebrewBirthday: a.birthDate ?? '',
    status: a.maritalStatus ?? '',
    community: a.community ?? '',
    occupation: a.occupation ?? '',
    city: a.city ?? '',
    phone: a.phone ?? '',
    email: a.email ?? '',
    photos: [] as string[],
    preferredStream: '',
    traits: pickWords(a.traits ?? '', TRAIT_WORDS),
    relationshipValues: sharedValues,
    brings,
    doesntSuit: '',
    flexibility: 'important' as const,
    phoneType: PHONE[a.phoneType] ?? 'filtered',
    aboutMe: a.aboutMe ?? '',
    aboutPartner: a.aboutPartner ?? '',
    matchmakerStatus: 'bright_red' as const,
    notes: [],
    lockedAt: null,
  }

  if (gender === 'male') {
    const partnerClothing =
      a.headcoverHer === 'רק פאה' ? 'wig_only'
      : a.headcoverHer === 'רק מטפחת' ? 'kerchief'
      : MALE_PARTNER_CLOTHING_BY_STYLE[a.clothingHer] ?? 'no_preference'
    return {
      ...common,
      style: MALE_STYLE[a.styleSelf] ?? 'open',
      partnerStyle: MALE_PARTNER_STYLE[a.styleSought] ?? 'open',
      clothing: 'black_kippah',
      partnerClothing,
    } as MaleProfile
  }

  return {
    ...common,
    style: FEMALE_STYLE[a.styleSelf] ?? 'open',
    partnerStyle: FEMALE_PARTNER_STYLE[a.styleSought] ?? 'open',
    clothing: FEMALE_CLOTHING[a.clothingSelf] ?? 'classic',
    headcovering: HEADCOVER[a.headcoverSelf] ?? 'no_preference',
    partnerClothing: 'bw_elegant',
  } as FemaleProfile
}

export function saveRegistration(gender: 'male' | 'female', answers: Record<string, string>): void {
  if (typeof window === 'undefined') return
  const id = `reg-${crypto.randomUUID()}`
  const profile = buildProfile(gender, answers, id)
  try {
    localStorage.setItem(KEY, JSON.stringify({ gender, profile } satisfies StoredRegistration))
    // Also sign the candidate into the personal area.
    setCandidateSession({
      id,
      gender,
      firstName: profile.firstName,
      age: profile.age,
      city: profile.city,
      community: profile.community,
      occupation: profile.occupation,
      style: profile.style,
      status: 'active',
    })
    window.dispatchEvent(new Event(REGISTERED_EVENT))
  } catch {
    // storage unavailable (private mode etc.): the form itself was still submitted
  }
}

export function getRegistration(): StoredRegistration | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredRegistration
    return parsed?.profile && (parsed.gender === 'male' || parsed.gender === 'female') ? parsed : null
  } catch {
    return null
  }
}

export function clearRegistration(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(REGISTERED_EVENT))
}
