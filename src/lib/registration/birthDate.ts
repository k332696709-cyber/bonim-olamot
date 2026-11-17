/**
 * Birth date helpers. The form stores the date as YYYY-MM-DD (from the calendar); the age and the
 * Hebrew date are worked out from it, so nobody has to type them.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseBirthDate(value: string | undefined | null): Date | null {
  const m = ISO.exec((value ?? '').trim())
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0)
  // Reject dates the calendar rolled over (for example 31 February).
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null
  return d
}

export function ageFromBirthDate(value: string | undefined | null, today = new Date()): number | null {
  const d = parseBirthDate(value)
  if (!d) return null
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

const LETTERS: [number, string][] = [
  [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'],
  [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'],
  [3, 'ג'], [2, 'ב'], [1, 'א'],
]

/** A number in Hebrew letters: 16 becomes ט״ז, 761 becomes תשס״א. */
function hebrewNumeral(n: number): string {
  let rest = n
  let out = ''
  for (const [value, letter] of LETTERS) {
    while (rest >= value) {
      if (rest === 15) { out += 'טו'; rest = 0; break }
      if (rest === 16) { out += 'טז'; rest = 0; break }
      out += letter
      rest -= value
    }
  }
  if (out.length <= 1) return out + '׳'
  return out.slice(0, -1) + '״' + out.slice(-1)
}

/** The Hebrew date in letters, for example "ט״ז בתשרי תשס״א". Empty if the date is not valid. */
export function hebrewDate(value: string | undefined | null): string {
  const d = parseBirthDate(value)
  if (!d) return ''
  try {
    const parts = new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(d)
    const day = Number(parts.find((x) => x.type === 'day')?.value)
    const month = parts.find((x) => x.type === 'month')?.value ?? ''
    const year = Number(parts.find((x) => x.type === 'year')?.value)
    if (!day || !month || !year) return ''
    return `${hebrewNumeral(day)} ב${month} ${hebrewNumeral(year % 1000)}`
  } catch {
    return ''
  }
}

/** "כ״ה בתשרי תשפ״ו (15.10.2005)", or the text as typed for older entries. */
export function birthDateDisplay(value: string | undefined | null): string {
  const d = parseBirthDate(value)
  if (!d) return (value ?? '').trim()
  const g = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  const h = hebrewDate(value)
  return h ? `${h} (${g})` : g
}

/** Sets answers.age from answers.birthDate when the date is valid. Returns the same object. */
export function withDerivedAge(answers: Record<string, string>): Record<string, string> {
  const age = ageFromBirthDate(answers.birthDate)
  if (age !== null) answers.age = String(age)
  return answers
}
