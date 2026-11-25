/** Shared by the matchmaker registration form, its API route and the admin Team page. */

export const SPECIALTIES = [
  { value: 'young',          he: 'צעירים',           en: 'Young' },
  { value: 'older',          he: 'מבוגרים',          en: 'Older' },
  { value: 'singles',        he: 'רווקים/רווקות',    en: 'Singles' },
  { value: 'hasidic',        he: 'חסידי',            en: 'Hasidic' },
  { value: 'litvish',        he: 'ליטאי',            en: 'Litvish' },
  { value: 'sephardic',      he: 'עדות המזרח',       en: 'Sephardic' },
  { value: 'divorced',       he: 'גרושים/גרושות',    en: 'Divorced' },
  { value: 'widowed',        he: 'אלמנים/אלמנות',    en: 'Widowed' },
  { value: 'baalei_teshuva', he: 'בעלי תשובה',       en: 'Baalei teshuva' },
  { value: 'special_needs',  he: 'צרכים מיוחדים',    en: 'Special needs' },
  { value: 'yeshivish',      he: 'ישיבתיים',         en: 'Yeshivish' },
  { value: 'chabad',         he: 'חב"ד',             en: 'Chabad' },
  { value: 'modern',        he: 'מודרניים',         en: 'Modern' },
  { value: 'open',          he: 'פתוחים',           en: 'Open-minded' },
  { value: 'chaniukim',     he: 'חניוקים',          en: 'Chanukim' },
  { value: 'academic',       he: 'אקדמאים',          en: 'Academics' },
  { value: 'abroad',         he: 'שידוכים מחו"ל',    en: 'From abroad' },
  { value: 'converts',       he: 'גרים',             en: 'Converts' },
] as const

export const SPECIALTY_VALUES: string[] = SPECIALTIES.map((s) => s.value)

export const specialtyLabel = (value: string, he: boolean) => {
  const s = SPECIALTIES.find((x) => x.value === value)
  return s ? (he ? s.he : s.en) : value
}

/** Languages a matchmaker can pick from; the first three are the common ones. Anyone can add another. */
export const LANGUAGES = [
  'עברית', 'אנגלית', 'יידיש',
  'צרפתית', 'ספרדית', 'רוסית', 'פורטוגזית', 'גרמנית', 'הולנדית (פלמית)', 'איטלקית',
  'ערבית', 'אמהרית', 'פרסית', 'תורכית', 'הונגרית', 'רומנית', 'פולנית', 'אוקראינית',
]

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MIN_AGE = 18
