// Rules that compare what one candidate asked for with what the other one is, using the structured
// answers of the questionnaire: style, clothing, head covering or hat, technology, standard of living,
// and a few life plans. They decide who the smart assistant may offer. Matchmakers are not bound by them.
import { parseChoices, CHOICE_SEP } from '@/constants/registrationForms'

type Answers = Record<string, string>

const choices = (v: string | undefined): string[] =>
  parseChoices(v ?? '').filter((x) => !x.startsWith('אחר'))

const hasOther = (v: string | undefined): boolean => (v ?? '').split(CHOICE_SEP).some((x) => x.trim().startsWith('אחר'))

// ── style ────────────────────────────────────────────────────────────────────
function styleKey(s: string): string {
  const t = s.replace(/[\s/]/g, '')
  if (t.includes('מאוד')) return 'very_modern'
  if (t.startsWith('מודרנ')) return 'modern'
  if (t.includes('במידה')) return 'open_ish'
  if (t.startsWith('פתוח')) return 'open'
  if (t.includes('ישיבתי')) return 'yeshivish'
  if (t.includes('עובד')) return 'shmura_work'
  return 'shmura' // שמור/שמורה, פשוטה/קלאסית
}

// ── clothing (a scale: a neighbouring level is accepted) ─────────────────────
const WOMAN_CLOTHING = ['פשוט', 'קלאסי', 'מכובד', 'עדכני בסטייל', 'מודרני', 'מודרני מאוד']
function manClothingRank(s: string): number {
  if (/רק צבעוני/.test(s)) return 4
  if (/יום חול צבעוני/.test(s)) return 3
  if (/אלגנטי|עדכני/.test(s)) return 2
  return 1 // black and white only
}

// ── head covering and hat ────────────────────────────────────────────────────
function headcoverKey(s: string): string {
  if (/ללא עדיפות/.test(s)) return 'any'
  if (/מטפחת/.test(s) && !/פאה/.test(s)) return 'kerchief'
  return 'wig'
}
function hatKey(s: string): string {
  if (/ללא/.test(s)) return 'none'
  return s.replace('כובע', '').trim()
}

// ── technology and living standard: the chosen options are the acceptable ones ──
const TECH_RANK = ['אין אינטרנט', 'מסונן לצורכי', 'מסונן בבית', 'רגיל, בשימוש מבוקר', 'שימוש חופשי']
const LIVING_RANK = ['פשוט וצנוע', 'מסודר ונוח', 'נוח עם פינוקים', 'רחב']
const rankOf = (list: string[], v: string): number => list.findIndex((k) => v.includes(k))

/** The seeker's wishes against the target's own answers. Anything not answered by either is skipped. */
export function wishesFit(seeker: Answers, seekerGender: 'male' | 'female', target: Answers): boolean {
  // Style: exact match on the kinds of style they chose.
  const sStyle = choices(seeker.styleSought)
  const tStyle = choices(target.styleSelf)
  if (sStyle.length && tStyle.length && !hasOther(seeker.styleSought)) {
    const wanted = new Set(sStyle.map(styleKey))
    if (!tStyle.some((x) => wanted.has(styleKey(x)))) return false
  }

  if (seekerGender === 'male') {
    // Clothing: a level next to the wanted one is accepted.
    const sC = choices(seeker.clothingHer).map((x) => WOMAN_CLOTHING.indexOf(x)).filter((n) => n >= 0)
    const tC = choices(target.clothingSelf).map((x) => WOMAN_CLOTHING.indexOf(x)).filter((n) => n >= 0)
    if (sC.length && tC.length && !hasOther(seeker.clothingHer) && !tC.some((t) => sC.some((s) => Math.abs(s - t) <= 1))) return false

    // Head covering: wig / kerchief, "no preference" fits all.
    const sH = choices(seeker.headcoverHer).map(headcoverKey)
    const tH = choices(target.headcoverSelf).map(headcoverKey)
    if (sH.length && tH.length && !hasOther(seeker.headcoverHer) && !sH.includes('any') && !tH.includes('any') && !tH.some((t) => sH.includes(t))) return false
  } else {
    const sC = choices(seeker.clothingHim).map(manClothingRank)
    const tC = choices(target.clothingSelf).map(manClothingRank)
    if (sC.length && tC.length && !hasOther(seeker.clothingHim) && !tC.some((t) => sC.some((s) => Math.abs(s - t) <= 1))) return false

    const sHat = choices(seeker.hatHim).map(hatKey)
    const tHat = choices(target.hatAfterWedding).map(hatKey)
    if (sHat.length && tHat.length && !hasOther(seeker.hatHim) && !tHat.some((t) => sHat.includes(t))) return false
  }

  // Technology and living standard: the target's level must be one the seeker accepts.
  const techWish = choices(seekerGender === 'male' ? seeker.techHer : seeker.techHim).map((x) => rankOf(TECH_RANK, x)).filter((n) => n >= 0)
  const techSelf = rankOf(TECH_RANK, target.techSelf ?? '')
  if (techWish.length && techSelf >= 0 && !techWish.includes(techSelf)) return false

  const livWish = choices(seekerGender === 'male' ? seeker.livingHer : seeker.livingHim).map((x) => rankOf(LIVING_RANK, x)).filter((n) => n >= 0)
  const livSelf = rankOf(LIVING_RANK, target.livingSelf ?? '')
  if (livWish.length && livSelf >= 0 && !livWish.includes(livSelf)) return false

  return true
}

// ── life plans: both sides' answers must not pull in opposite directions ─────
const TORAH_RANK: Record<string, number> = { 'קביעות עיתים': 1, 'חצי עובד חצי לומד': 2, 'לימוד בכולל': 3 }
const KIDS_RANK: Record<string, number> = { '1 עד 2': 1, '3 עד 4': 2, '5 עד 6': 3, '7 עד 8': 4 }

function livePlaceKey(s: string): 'israel' | 'abroad' | 'flex' | '' {
  if (!s) return ''
  if (/חו"ל|חול/.test(s) && /פתוח|עדיפות/.test(s)) return 'flex'
  if (/חו"ל/.test(s)) return 'abroad'
  if (/עדיפות/.test(s)) return 'flex'
  return 'israel'
}

export function plansFit(a: Answers, b: Answers): boolean {
  const ta = TORAH_RANK[(a.torahAfter ?? '').trim()]
  const tb = TORAH_RANK[(b.torahAfter ?? '').trim()]
  if (ta && tb && Math.abs(ta - tb) >= 2) return false

  const ka = KIDS_RANK[(a.kidsWanted ?? '').trim()]
  const kb = KIDS_RANK[(b.kidsWanted ?? '').trim()]
  if (ka && kb && Math.abs(ka - kb) >= 2) return false

  const la = livePlaceKey((a.livePlace ?? '').trim())
  const lb = livePlaceKey((b.livePlace ?? '').trim())
  if ((la === 'israel' && lb === 'abroad') || (la === 'abroad' && lb === 'israel')) return false
  return true
}
