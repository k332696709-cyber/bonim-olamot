import type {
  MaleProfile, FemaleProfile,
  MaleStyle, FemaleStyle,
  MalePartnerStyle, FemalePartnerStyle,
  Flexibility, PhoneType,
} from '@/types/registration'

// ─── Style rank mappings (1 = most conservative, 5 = most modern) ────────────

const MALE_STYLE_RANK: Record<MaleStyle, number> = {
  yeshivish: 1, open_ish: 2, open: 3, modern: 4, very_modern: 5,
}
const FEMALE_STYLE_RANK: Record<FemaleStyle, number> = {
  shmura: 1, open_ish: 2, open: 3, modern: 4, very_modern: 5,
}
const MALE_PARTNER_STYLE_RANK: Record<MalePartnerStyle, number> = {
  closed: 1, open_ish: 2, open: 3, modern: 4, very_modern: 5,
}
const FEMALE_PARTNER_STYLE_RANK: Record<FemalePartnerStyle, number> = {
  shmur: 1, open_ish: 2, open: 3, modern: 4, very_modern: 5,
}

const PHONE_RANK: Record<PhoneType, number> = {
  kosher: 1, filtered: 2, work_smartphone: 3, smartphone: 4,
}

// Clothing conservativeness rank (1=most conservative, 5=most modern)
const FEMALE_CLOTHING_CONSERV: Record<string, number> = {
  very_simple: 1, simple: 2, classic: 3, stylish: 3,
  respectable: 3, modern: 4, very_modern: 5,
}
// Combines headcovering + preferred partner clothing for females into a conservativeness level
const MALE_PARTNER_CLOTHING_CONSERV: Record<string, number> = {
  very_simple: 1, wig_only: 1, wig_kerchief: 1,
  kerchief: 2, wig_any: 2, simple_updated: 2, wig_ribbon: 2, wig_hat: 2,
  modern_modest: 3, no_preference: 3,
  very_modern: 4,
}
// Headcovering conservativeness for conflict detection
const FEMALE_HEADCOVERING_TYPE: Record<string, 'wig' | 'kerchief' | 'flexible'> = {
  wig_no_cut: 'wig', wig_with_cut: 'wig', wig_only: 'wig', wig_plus_cover: 'wig',
  kerchief_only: 'kerchief',
  no_preference: 'flexible',
}
const MALE_PARTNER_HEADCOVERING_PREF: Record<string, 'wig' | 'kerchief' | 'flexible'> = {
  wig_only: 'wig', wig_kerchief: 'wig', wig_ribbon: 'wig', wig_hat: 'wig', wig_any: 'wig',
  kerchief: 'kerchief',
  very_simple: 'flexible', simple_updated: 'flexible',
  modern_modest: 'flexible', very_modern: 'flexible', no_preference: 'flexible',
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConflictAlert {
  severity: 'major' | 'minor'
  field: string
  he: string
  en: string
}

export interface CompatibilityBreakdown {
  style:     { score: number; maxScore: 35 }
  values:    { score: number; maxScore: 30 }
  practical: { score: number; maxScore: 20 }
  traits:    { score: number; maxScore: 15 }
}

export interface CompatibilityResult {
  score: number
  breakdown: CompatibilityBreakdown
  conflicts: ConflictAlert[]
  highlights: string[]
  highlightsHe: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreByGap(gap: number): number {
  if (gap === 0) return 100
  if (gap === 1) return 80
  if (gap === 2) return 50
  if (gap === 3) return 15
  return 0
}

function intersection<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x))
}

function flexibilityModifier(flexibility: Flexibility, gap: number): number {
  if (flexibility === 'very_important' && gap >= 2) return -0.25
  if (flexibility === 'very_important' && gap >= 1) return -0.10
  if (flexibility === 'not_important') return 0.10
  return 0
}

// ─── Main function ────────────────────────────────────────────────────────────

export function calculateCompatibility(
  bachur: MaleProfile,
  bachurah: FemaleProfile,
): CompatibilityResult {
  const conflicts: ConflictAlert[] = []
  const highlights: string[] = []
  const highlightsHe: string[] = []

  // ── 1. Style score (max 35) ───────────────────────────────────────────────

  const bachurPreferRank   = MALE_PARTNER_STYLE_RANK[bachur.partnerStyle]
  const bachurahActualRank = FEMALE_STYLE_RANK[bachurah.style]
  const gap1 = Math.abs(bachurPreferRank - bachurahActualRank)

  const bachurahPreferRank = FEMALE_PARTNER_STYLE_RANK[bachurah.partnerStyle]
  const bachurActualRank   = MALE_STYLE_RANK[bachur.style]
  const gap2 = Math.abs(bachurahPreferRank - bachurActualRank)

  let rawStylePct = (scoreByGap(gap1) + scoreByGap(gap2)) / 2 / 100

  rawStylePct = Math.min(1, Math.max(0,
    rawStylePct
    + flexibilityModifier(bachur.flexibility, gap1)
    + flexibilityModifier(bachurah.flexibility, gap2),
  ))

  const stylePoints = Math.round(rawStylePct * 35)

  // Style conflicts
  if (gap1 >= 3 && ['important', 'very_important'].includes(bachur.flexibility)) {
    conflicts.push({
      severity: 'major', field: 'style',
      he: 'פער גדול בסגנון – הבחור דורש סגנון שונה מהותית מסגנון הבחורה',
      en: 'Major style gap – the Bachur expects a significantly different style',
    })
  }
  if (gap2 >= 3 && ['important', 'very_important'].includes(bachurah.flexibility)) {
    conflicts.push({
      severity: 'major', field: 'style',
      he: 'פער גדול בסגנון – הבחורה מחפשת סגנון שונה מהותית מסגנון הבחור',
      en: 'Major style gap – the Bachurah expects a significantly different style',
    })
  }
  if (gap1 === 2 && bachur.flexibility === 'very_important') {
    conflicts.push({
      severity: 'minor', field: 'style_minor',
      he: 'פער בינוני בסגנון – הבחור מייחס חשיבות רבה לסגנון',
      en: 'Moderate style gap – Bachur considers style very important',
    })
  }
  if (gap2 === 2 && bachurah.flexibility === 'very_important') {
    conflicts.push({
      severity: 'minor', field: 'style_minor_f',
      he: 'פער בינוני בסגנון – הבחורה מייחסת חשיבות רבה לסגנון',
      en: 'Moderate style gap – Bachurah considers style very important',
    })
  }
  if (rawStylePct >= 0.85) {
    highlights.push('Excellent style alignment')
    highlightsHe.push('התאמה מצוינת בסגנון חיים')
  }

  // ── 2. Values score (max 30) ──────────────────────────────────────────────

  const sharedValues = intersection(bachur.relationshipValues, bachurah.relationshipValues)
  const sharedBrings = intersection(bachur.brings, bachurah.brings)
  const maxVals = Math.max(bachur.relationshipValues.length, bachurah.relationshipValues.length, 1)
  const maxBrings = Math.max(bachur.brings.length, bachurah.brings.length, 1)

  const valuesPct = (sharedValues.length / maxVals) * 0.7 + (sharedBrings.length / maxBrings) * 0.3
  const valuesPoints = Math.round(valuesPct * 30)

  if (sharedValues.length >= 2) {
    highlights.push(`${sharedValues.length} shared core values`)
    highlightsHe.push(`${sharedValues.length} ערכים משותפים`)
  }

  // ── 3. Practical score (max 20) ───────────────────────────────────────────

  // Phone compatibility (10 pts)
  const phoneGap = Math.abs(PHONE_RANK[bachur.phoneType] - PHONE_RANK[bachurah.phoneType])
  const phoneScore = phoneGap === 0 ? 100 : phoneGap === 1 ? 75 : phoneGap === 2 ? 30 : 0
  const phonePoints = Math.round(phoneScore / 100 * 10)

  if (phoneGap >= 2) {
    conflicts.push({
      severity: 'major', field: 'phone',
      he: 'אי-התאמה בסוג הטלפון – פער משמעותי בין רמות הכשרות הדיגיטלית',
      en: 'Phone incompatibility – significant gap in digital kosher standards',
    })
  }

  // Clothing/modesty compatibility (10 pts)
  const femaleCons = FEMALE_CLOTHING_CONSERV[bachurah.clothing] ?? 3
  const malePref   = MALE_PARTNER_CLOTHING_CONSERV[bachur.partnerClothing] ?? 3
  const clothingGap = Math.abs(femaleCons - malePref)
  const clothingScore = clothingGap === 0 ? 100 : clothingGap === 1 ? 70 : clothingGap === 2 ? 30 : 0
  const clothingPoints = Math.round(clothingScore / 100 * 10)

  // Headcovering conflict
  const maleHeadPref   = MALE_PARTNER_HEADCOVERING_PREF[bachur.partnerClothing]
  const femaleHeadPlan = FEMALE_HEADCOVERING_TYPE[bachurah.headcovering]
  if (maleHeadPref === 'wig' && femaleHeadPlan === 'kerchief') {
    conflicts.push({
      severity: 'major', field: 'headcovering',
      he: 'סתירה בכיסוי ראש – הבחור מצפה לפאה אך הבחורה מתכננת מטפחת',
      en: 'Headcovering conflict – Bachur expects a wig, Bachurah plans kerchief',
    })
  }
  if (maleHeadPref === 'kerchief' && femaleHeadPlan === 'wig') {
    conflicts.push({
      severity: 'minor', field: 'headcovering',
      he: 'אי-התאמה קלה בכיסוי ראש',
      en: 'Minor headcovering mismatch',
    })
  }

  const practicalPoints = phonePoints + clothingPoints

  // ── 4. Traits score (max 15) ──────────────────────────────────────────────

  const sharedTraits = intersection(bachur.traits, bachurah.traits)
  const maxTraits = Math.max(bachur.traits.length, bachurah.traits.length, 1)
  const traitPct = sharedTraits.length / maxTraits
  const traitPoints = Math.round(traitPct * 15)

  if (sharedTraits.length >= 2) {
    highlights.push(`Shared traits: ${sharedTraits.join(', ')}`)
    highlightsHe.push(`תכונות משותפות: ${sharedTraits.join(', ')}`)
  }

  // ── 5. Age gap ────────────────────────────────────────────────────────────

  const ageDiff = Math.abs(bachur.age - bachurah.age)
  if (ageDiff > 8) {
    conflicts.push({
      severity: 'minor', field: 'age',
      he: `פער גיל משמעותי (${ageDiff} שנים)`,
      en: `Significant age gap (${ageDiff} years)`,
    })
  }

  // ── 6. Stream/community mismatch ─────────────────────────────────────────

  if (
    bachur.preferredStream &&
    bachurah.preferredStream &&
    bachur.preferredStream !== bachurah.preferredStream
  ) {
    conflicts.push({
      severity: 'minor', field: 'stream',
      he: `אי-התאמה בזרם – ${bachur.preferredStream} לעומת ${bachurah.preferredStream}`,
      en: `Stream mismatch – ${bachur.preferredStream} vs ${bachurah.preferredStream}`,
    })
  }

  // ── 7. doesntSuit cross-check (if text present) ───────────────────────────
  // Simple keyword detection against each other's style labels
  const bachurDoesntSuit = bachur.doesntSuit?.toLowerCase() ?? ''
  const bachurahDoesntSuit = bachurah.doesntSuit?.toLowerCase() ?? ''
  const bachurStyleLabel = bachur.style
  const bachurahStyleLabel = bachurah.style
  if (bachurDoesntSuit && bachurahStyleLabel.includes(bachurDoesntSuit.slice(0, 5))) {
    conflicts.push({
      severity: 'major', field: 'doesntSuit',
      he: 'תיאור "לא מתאים לי" של הבחור עשוי להתאים לסגנון הבחורה',
      en: "Bachur's \"doesn't suit me\" description may match Bachurah's style",
    })
  }
  if (bachurahDoesntSuit && bachurStyleLabel.includes(bachurahDoesntSuit.slice(0, 5))) {
    conflicts.push({
      severity: 'major', field: 'doesntSuit_f',
      he: 'תיאור "לא מתאים לי" של הבחורה עשוי להתאים לסגנון הבחור',
      en: "Bachurah's \"doesn't suit me\" description may match Bachur's style",
    })
  }

  // ── Final score ───────────────────────────────────────────────────────────

  const totalPoints = stylePoints + valuesPoints + practicalPoints + traitPoints
  const score = Math.min(100, Math.max(0, totalPoints))

  return {
    score,
    breakdown: {
      style:     { score: stylePoints,     maxScore: 35 },
      values:    { score: valuesPoints,    maxScore: 30 },
      practical: { score: practicalPoints, maxScore: 20 },
      traits:    { score: traitPoints,     maxScore: 15 },
    },
    conflicts,
    highlights,
    highlightsHe,
  }
}
