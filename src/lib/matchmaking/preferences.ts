import { CITY_OPTIONS } from '@/constants/communityLists'
import { plansFit, wishesFit } from '@/lib/matchmaking/answerRules'

// What a candidate wrote about who they are looking for, turned into rules the smart assistant must
// respect before it offers anyone: the age range, and the community or edah they want or do not want.
// These rules apply only to what candidates are offered. Matchmakers still see everyone.

/** "22-27" (the picker's format) as a pair of ages, or null when not set. */
export function parseAgeRange(raw: string | undefined | null): [number, number] | null {
  const nums = (raw ?? '').match(/[0-9]{2,3}/g)
  if (!nums || nums.length < 2) return null
  const a = Number(nums[0])
  const b = Number(nums[1])
  return a <= b ? [a, b] : [b, a]
}

/** One year of leeway on each side of the range, as a person would allow. */
export const AGE_LEEWAY = 1

export function ageFits(age: number, range: [number, number] | null): boolean {
  if (!range || !age) return true
  return age >= range[0] - AGE_LEEWAY && age <= range[1] + AGE_LEEWAY
}

// Groups people name in free text. Each is recognised by a short stem, so "ספרדית", "ספרדי" and
// "ספרדים" are the same group.
const GROUPS: [string, string[]][] = [
  ['ashkenazi', ['אשכנז']],
  ['sephardi', ['ספרד']],
  ['teimani', ['תימנ']],
  ['moroccan', ['מרוקא', 'מרוקו']],
  ['iraqi', ['עיראק']],
  ['persian', ['פרס']],
  ['bukharan', ['בוכר']],
  ['georgian', ['גרוזי']],
  ['kurdish', ['כורד']],
  ['libyan', ['לוב']],
  ['tunisian', ['תוניס']],
  ['egyptian', ['מצר']],
  ['syrian', ['סורי']],
  ['turkish', ['טורק']],
  ['ethiopian', ['אתיופ']],
  ['chasidi', ['חסיד', 'גור', 'בעלז', 'ויז', 'סאטמר', 'חב"ד', 'חבד', 'ברסלב', 'צאנז', 'סקווירא', 'בויאן', 'תולדות']],
  ['litai', ['ליטא']],
  ['modern', ['חרדי מודרני', 'חרדית מודרנית', 'מודרנ']],
  ['dati', ['דתי לאומי', 'דתיה לאומית', 'דתי-לאומי', 'לאומי']],
]

const NEGATION = /(לא|בלי|ללא|שלא|חוץ|פרט)\s*$/
const OPEN = /(לא משנה|ללא העדפה|אין העדפה|פתוח|פתוחה|הכל|כל עדה|כולם|גמיש)/

/** Groups mentioned in a text, split into wanted and rejected (a negation word just before). */
export function groupsMentioned(text: string): { wanted: Set<string>; rejected: Set<string>; open: boolean } {
  const t = text.replace(/[״"]/g, '"')
  const wanted = new Set<string>()
  const rejected = new Set<string>()
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  for (const [id, stems] of GROUPS) {
    for (const stem of stems) {
      // A short stem must be a whole word ("גור", not the "גור" inside "לגור"); a longer one may carry
      // a one-letter prefix and any ending.
      const short = stem.length <= 3
      const re = short
        ? new RegExp(`(^|[^א-ת])ו?${esc(stem)}(י|ית|ים|ות)?(?![א-ת])`, 'g')
        : new RegExp(`(^|[^א-ת])[והבלמש]?${esc(stem)}`, 'g')
      for (let m = re.exec(t); m; m = re.exec(t)) {
        const i = m.index + m[1].length // where the word starts, after the boundary character
        const before = t.slice(Math.max(0, i - 14), i)
        if (NEGATION.test(before)) rejected.add(id)
        else wanted.add(id)
      }
    }
  }
  return { wanted, rejected, open: OPEN.test(text) }
}

/** Every group a person belongs to, from their community, edah and Hasidic court. */
export function groupsOf(text: string): Set<string> {
  const { wanted } = groupsMentioned(text)
  return wanted
}

// Cities named in free text. A few names are ordinary words too, so they are left out.
const CITY_STOP = new Set(['אזור', 'רמות', 'גאולה', 'ביתר', 'חריש', 'יבנאל'])
const normCity = (c: string) => c.replace(/\([^)]*\)/g, ' ').replace(/[-־]/g, ' ').replace(/\s+/g, ' ').trim()
const escRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const CITIES = Array.from(new Set((CITY_OPTIONS as string[]).map(normCity))).filter((c) => c.length >= 3 && !CITY_STOP.has(c)).sort((a, b) => b.length - a.length)

/** Cities a person named as unwanted: anything in "does not suit me", or after a "no" elsewhere. */
export function citiesRejected(a: Record<string, string>): Set<string> {
  const out = new Set<string>()
  const scan = (text: string, onlyNegated: boolean) => {
    const t = text.replace(/[-־]/g, ' ')
    for (const c of CITIES) {
      const re = new RegExp(`(^|[^א-ת])[והבלמש]?${escRe(c)}(?![א-ת])`, 'g')
      for (let m = re.exec(t); m; m = re.exec(t)) {
        const before = t.slice(0, m.index + m[1].length)
        if (!onlyNegated || NEGATION.test(before)) out.add(c)
      }
    }
  }
  scan(a.notSuitable ?? '', false)
  scan(a.edahSought ?? '', true)
  scan(a.aboutPartner ?? '', true)
  return out
}

const cityIs = (city: string, set: Set<string>) => {
  const c = normCity(city ?? '')
  return !!c && Array.from(set).some((x) => c === x || c.includes(x))
}

export interface PrefInput {
  myGender: 'male' | 'female'
  myCity: string
  otherCity: string
  /** The person looking: the answers they gave about who they want, and their own age. */
  myAge: number
  myAnswers: Record<string, string>
  /** The proposal: their age, a text with their community/edah/court, and their own answers if any. */
  otherAge: number
  otherText: string
  otherAnswers: Record<string, string> | null
}

/** Whether a proposal respects what the candidate asked for (and the other side's age wish too). */
export function respectsPreferences(i: PrefInput): boolean {
  // Age: the range the person chose, with a year of leeway; and the other side's range must hold me.
  if (!ageFits(i.otherAge, parseAgeRange(i.myAnswers.ageRange))) return false
  if (i.otherAnswers && !ageFits(i.myAge, parseAgeRange(i.otherAnswers.ageRange))) return false

  // Cities they do not want (their own words), in both directions.
  if (cityIs(i.otherCity, citiesRejected(i.myAnswers))) return false
  if (i.otherAnswers && cityIs(i.myCity, citiesRejected(i.otherAnswers))) return false

  // Style, clothing, head covering or hat, technology, living standard, and the life plans.
  if (i.otherAnswers) {
    const otherGender = i.myGender === 'male' ? 'female' : 'male'
    if (!wishesFit(i.myAnswers, i.myGender, i.otherAnswers)) return false
    if (!wishesFit(i.otherAnswers, otherGender, i.myAnswers)) return false
    if (!plansFit(i.myAnswers, i.otherAnswers)) return false
  }

  // Community / edah: what they want, and what they said does not suit them at all.
  const sought = groupsMentioned(i.myAnswers.edahSought ?? '')
  const notSuitable = groupsMentioned(i.myAnswers.notSuitable ?? '')
  const theirs = groupsOf(i.otherText)
  if (theirs.size === 0) return true // nothing known about them: do not guess

  for (const g of Array.from(theirs)) if (sought.rejected.has(g)) return false
  // "Does not suit me": every group named there is rejected, whether or not a "no" is written.
  for (const g of Array.from(notSuitable.wanted)) if (theirs.has(g)) return false
  for (const g of Array.from(notSuitable.rejected)) if (theirs.has(g)) return false

  const wanted = Array.from(sought.wanted)
  if (!sought.open && wanted.length > 0 && !wanted.some((g) => theirs.has(g))) return false
  return true
}
