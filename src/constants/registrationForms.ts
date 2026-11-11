/**
 * Registration questionnaires copied one-to-one from the Tally forms:
 *   male   – https://tally.so/r/jalG6J  "שאלון הכרות 'בונים עולמות' מיועדים"
 *   female – https://tally.so/r/9q72VY  "שאלון הכרות 'בונים עולמות' מיועדות"
 * Same questions, order, wording, required flags, dropdown options and the
 * same two pages. Only obvious typos were fixed (noted inline).
 */

export type FieldType = 'text' | 'tel' | 'email' | 'textarea' | 'select' | 'file'

export interface TallyField {
  id: string
  label: string
  hint?: string
  type: FieldType
  required: boolean
  options?: string[]
  /** Several options may be chosen (stored joined with " | "). */
  multi?: boolean
  /** Short numeric free-text answers (age, number of children). */
  numeric?: boolean
  /** Section heading rendered above this field. */
  sectionBefore?: string
}

export interface TallyPage {
  fields: TallyField[]
}

export interface RegistrationForm {
  gender: 'male' | 'female'
  title: string
  pages: TallyPage[]
}

/** Every choice list ends with "other". */
export const OTHER = 'אחר'
export const CHOICE_SEP = ' | '

export function withOther(options: string[]): string[] {
  return options.includes(OTHER) ? options : [...options, OTHER]
}

/** Splits a stored answer into its chosen items. */
export function parseChoices(value: string): string[] {
  return value.split(CHOICE_SEP).map((x) => x.trim()).filter(Boolean)
}

/** Readable form of a stored answer ("a | b" becomes "a, b"). */
export function prettyChoices(value?: string): string {
  return value ? parseChoices(value).join(', ') : ''
}

/** First chosen item, for places that need a single value. Free-text "other" gives ''. */
export function firstChoice(value?: string): string {
  const first = parseChoices(value ?? '')[0] ?? ''
  return first === OTHER || first.startsWith(OTHER + ': ') ? '' : first
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024
export const MAX_PHOTOS = 5

const FAMILY_MALE = ['רווק', 'גרוש ללא', 'גרוש עם ילדים', 'אלמן ללא', 'אלמן עם ילדים']
const FAMILY_FEMALE = ['רווקה', 'גרושה ללא', 'גרושה עם ילדים', 'אלמנה']
const PHONE_TYPES = ['פשוט (כשר)', 'מוגן/מסונן', 'לא כשר', 'גם כשר וגם מוגן', 'גם כשר וגם לא מוגן']
const HEADCOVER = [
  'פאה טופ לייס/ללא תספורת',
  'פאה טופ לייס/עם תספורת',
  'רק פאה',
  "פאה עם כיסוי (סרט/קשת וכו')",
  'רק מטפחת',
  'פאה/מטפחת ללא עדיפות',
]
const HOUSE_STYLE = ['שמורה', 'קלאסית', 'פתוחה', 'פתוחה במידה', 'מודרנית', 'מודרנית מאוד']

/** Page 2 is identical in both forms except the partner question wording. */
const page2 = (partnerLabel: string): TallyPage => ({
  fields: [
    { id: 'ageRange', label: 'טווח גילאים', type: 'text', required: true, sectionBefore: 'פרטים חשובים לשדכנים' },
    { id: 'country',  label: 'ארץ מועדפת', type: 'text', required: true },
    { id: 'medical',  label: 'מצב רפואי/נפשי', type: 'select', required: true, options: ['תקין', 'יש בעיה קלה', 'מצב מאתגר'] },
    { id: 'medicalDetail', label: 'בעיה רפואית/נפשית', hint: 'נא לציין אם יש', type: 'textarea', required: false },
    { id: 'parents',  label: 'מצב ההורים', type: 'select', required: true, options: ['נשואים', 'גרושים', 'אלמנ/ה'] },
    { id: 'houseStyle', label: 'סגנון הבית', type: 'select', required: true, options: HOUSE_STYLE },
    { id: 'aboutMe',  label: 'פרטים נוספים שהיית רוצה להוסיף על עצמך:', type: 'textarea', required: true },
    { id: 'aboutPartner', label: partnerLabel, type: 'textarea', required: true },
    { id: 'ref1Name',  label: 'שם:', type: 'text', required: true, sectionBefore: 'מספרים לבירורים' },
    { id: 'ref1Phone', label: 'טלפון:', type: 'tel', required: true },
    { id: 'ref2Name',  label: 'שם:', type: 'text', required: false },
    { id: 'ref2Phone', label: 'טלפון:', type: 'tel', required: false },
    { id: 'ref3Name',  label: 'שם:', type: 'text', required: false },
    { id: 'ref3Phone', label: 'טלפון:', type: 'tel', required: false },
  ],
})

export const MALE_FORM: RegistrationForm = {
  gender: 'male',
  title: "שאלון הכרות 'בונים עולמות' מיועדים",
  pages: [
    {
      fields: [
        { id: 'fullName',  label: 'שם מלא', type: 'text', required: true },
        { id: 'nickname',  label: 'כינוי (אם יש)', type: 'text', required: false },
        { id: 'lastName',  label: 'שם משפחה', type: 'text', required: true },
        { id: 'age',       label: 'גיל', type: 'text', required: true, numeric: true },
        { id: 'birthDate', label: 'תאריך לידה + עברי', type: 'text', required: true },
        { id: 'maritalStatus', label: 'מצב משפחתי', type: 'select', required: true, options: FAMILY_MALE },
        { id: 'childrenCount', label: 'מספר ילדים (גרוש/אלמן עם)', hint: '(אם אין, להקליד 0)', type: 'text', required: true, numeric: true },
        { id: 'edah',      label: 'עדה', type: 'text', required: true },
        { id: 'community', label: 'השתייכות/קהילה', type: 'text', required: true },
        { id: 'city',      label: 'עיר מגורים (לבד/אצל ההורים)', type: 'text', required: true },
        { id: 'occupation', label: 'עיסוק', type: 'text', required: true },
        { id: 'professionalStudies', label: 'לימודי מקצוע (עבר/כעת/בעתיד)', type: 'textarea', required: true },
        { id: 'studies',   label: 'לימודים (ישיבה קטנה/גדולה/גבוהה)', type: 'textarea', required: true },
        { id: 'framework', label: 'קביעת עיתים/מסגרת', type: 'textarea', required: true },
        { id: 'phoneType', label: 'סוג טלפון שלך', type: 'select', required: true, options: PHONE_TYPES },
        { id: 'phone',     label: 'מספר טלפון', type: 'tel', required: true },
        { id: 'email',     label: 'אימייל', type: 'email', required: true },
        { id: 'photo',     label: 'תמונות שידוכים (עד 5)', type: 'file', required: true, hint: 'אפשר להעלות עד 5 תמונות. התמונה הראשונה היא הראשית.' },
        {
          id: 'styleSelf', label: 'איך אתה מגדיר את הסגנון שלך?', type: 'select', multi: true, required: true, sectionBefore: 'פרטים ממוקדים',
          options: ['שמור ישיבתי', 'שמור עובד', 'פתוח', 'פתוח במידה', 'מודרני', 'מודרני מאוד'],
        },
        { id: 'styleSelfDetail', label: 'במה זה מתבטא בעיקר? (בלבוש, גישה לטכנולוגיה, רמת חיים, סגנון)', type: 'textarea', required: true },
        {
          id: 'clothingSelf', label: 'סגנון לבוש שלך?', type: 'select', multi: true, required: true,
          options: ['(פשוט) רק שחור לבן', 'שחור לבן, עדכני/אלגנטי', 'שבת, אירועים ש"לב, יום חול צבעוני', 'רק צבעוני', 'אחר'],
        },
        { id: 'hatAfterWedding', label: 'כובע לאחר חתונה', type: 'select', multi: true, required: true, options: ['קנייטש', 'שטריימל', 'ספודיק', 'ללא כלל', 'אחר'] },
        { id: 'techSelf',   label: 'גישה לטכנולוגיה', type: 'textarea', required: true },
        { id: 'livingSelf', label: 'רמת חיים, סגנון', type: 'textarea', required: true },
        {
          id: 'styleSought', label: 'איזה סגנון אתה מחפש?', type: 'select', multi: true, required: true,
          options: ['פשוטה/קלאסית', 'פתוחה', 'פתוחה במידה', 'מודרנית', 'מודרנית מאוד'],
        },
        { id: 'styleSoughtDetail', label: 'במה זה מתבטא בעיקר? (בלבוש, גישה לטכנולוגיה, רמת חיים/סגנון)', type: 'textarea', required: true },
        {
          id: 'clothingHer', label: 'סגנון לבוש שלה', type: 'select', multi: true, required: true,
          options: ['פשוט', 'קלאסי', 'עדכני בסטייל', 'מכובד', 'מודרני', 'מודרני מאוד'],
        },
        { id: 'headcoverHer', label: 'כיסוי ראש שלה לאחר חתונה', type: 'select', multi: true, required: true, options: [...HEADCOVER, 'אחר'] },
        { id: 'techHer',    label: 'גישה שלה לטכנולוגיה', type: 'textarea', required: true },
        { id: 'livingHer',  label: 'רמת חיים/סגנון שלה', type: 'textarea', required: true },
        { id: 'traits',     label: 'מה מאפיין אותך במיוחד?', hint: "רגוע/יוזם/ביישן ועוד' (נא לכתוב מספר מאפיינים)", type: 'textarea', required: true },
        { id: 'brings',     label: 'מה אתה מביא לנישואים?', hint: "יציבות/עומק/אמינות ועוד' (נא לכתוב מספר דברים)", type: 'textarea', required: true },
        { id: 'edahSought', label: 'עדה/זרם/קהילה מעודפ/ת?', type: 'textarea', required: true },
        { id: 'notSuitable', label: 'מה לא מתאים בכלל?', hint: "מודרנית מדי, סגורה מדי, שקטה מדי ועוד'", type: 'textarea', required: true },
      ],
    },
    page2('פרטים נוספים על בת הזוג שאתה מחפש:'),
  ],
}

export const FEMALE_FORM: RegistrationForm = {
  gender: 'female',
  title: "שאלון הכרות 'בונים עולמות' מיועדות",
  pages: [
    {
      fields: [
        { id: 'fullName',  label: 'שם מלא', type: 'text', required: true },
        { id: 'nickname',  label: 'כינוי (אם יש)', type: 'text', required: false },
        { id: 'lastName',  label: 'שם משפחה', type: 'text', required: true },
        { id: 'age',       label: 'גיל', type: 'text', required: true, numeric: true },
        { id: 'birthDate', label: 'תאריך לידה + עברי', type: 'text', required: true },
        { id: 'maritalStatus', label: 'מצב משפחתי', type: 'select', required: true, options: FAMILY_FEMALE },
        { id: 'childrenCount', label: 'מספר ילדים (גרושה אלמנה עם)', hint: '(אם אין, להקליד 0)', type: 'text', required: true, numeric: true },
        { id: 'edah',      label: 'עדה', type: 'text', required: true },
        { id: 'community', label: 'השתייכות/קהילה', type: 'text', required: true },
        { id: 'city',      label: 'עיר מגורים (לבד/אצל ההורים)', type: 'text', required: true },
        { id: 'occupation', label: 'עיסוק', type: 'text', required: true },
        { id: 'professionalStudies', label: 'לימודי מקצוע (עבר/כעת/בעתיד)', type: 'textarea', required: true },
        { id: 'studies',   label: 'לימודים (תיכון/סמינר/מדרשה)', type: 'textarea', required: true },
        { id: 'phoneType', label: 'סוג טלפון שלך', type: 'select', required: true, options: PHONE_TYPES },
        { id: 'phone',     label: 'מספר טלפון', type: 'tel', required: true },
        { id: 'email',     label: 'אימייל', type: 'email', required: true },
        { id: 'photo',     label: 'תמונות שידוכים (עד 5)', type: 'file', required: true, hint: 'אפשר להעלות עד 5 תמונות. התמונה הראשונה היא הראשית.' },
        {
          id: 'styleSelf', label: 'איך את מגדירה את הסגנון שלך?', type: 'select', multi: true, required: true,
          options: ['שמורה', 'פתוחה', 'פתוחה במידה', 'מודרנית', 'מודרנית מאוד'],
        },
        { id: 'styleSelfDetail', label: 'במה זה מתבטא בעיקר? (בלבוש/גישה לטכנולוגיה/רמת חיים/סגנון)', type: 'textarea', required: true },
        {
          id: 'clothingSelf', label: 'סגנון לבוש שלך', type: 'select', multi: true, required: true,
          options: ['פשוט', 'קלאסי', 'עדכני בסטייל', 'מכובד', 'מודרני', 'מודרני מאוד'],
        },
        { id: 'headcoverSelf', label: 'כיסוי ראש לאחר חתונה', type: 'select', multi: true, required: true, options: HEADCOVER },
        { id: 'techSelf',   label: 'גישה לטכנולוגיה', type: 'textarea', required: true },
        { id: 'livingSelf', label: 'רמת חיים/סגנון', type: 'textarea', required: true },
        {
          id: 'styleSought', label: 'איזה סגנון את מחפשת?', type: 'select', multi: true, required: true,
          options: ['שמור/ישיבתי', 'שמור/עובד', 'פתוח', 'פתוח במידה', 'מודרני', 'מודרני מאוד'],
        },
        // Tally's original is missing the closing parenthesis here; added.
        { id: 'styleSoughtDetail', label: 'במה זה מתבטא בעיקר? (בלבוש/גישה לטכנולוגיה/רמת חיים, סגנון)', type: 'textarea', required: true },
        {
          id: 'clothingHim', label: 'סגנון לבוש שלו', type: 'select', multi: true, required: true,
          options: ['רק שחור לבן', 'שחור לבן. אלגנטי/עדכני', 'שחור לבן שבת ואירועים, יום חול צבעוני', 'רק צבעוני'],
        },
        { id: 'hatHim',     label: 'כובע אחרי חתונה', type: 'select', multi: true, required: true, options: ['כובע קנייטש', 'שטריימל', 'ספודיק', 'ללא כובע כלל'] },
        { id: 'techHim',    label: 'גישה שלו לטכנולוגיה', type: 'textarea', required: true },
        { id: 'livingHim',  label: 'רמת חיים/סגנון שלו', type: 'textarea', required: true },
        { id: 'traits',     label: 'מה מאפיין אותך במיוחד?', hint: "רגועה/יוזמת/ביישנית ועוד' (נא לכתוב מספר מאפיינים)", type: 'textarea', required: true },
        { id: 'brings',     label: 'מה את מביאה לנשואים?', hint: "יציבות/עומק/אמינות ועוד' (נא לכתוב מספר דברים)", type: 'textarea', required: true },
        { id: 'edahSought', label: 'עדה/זרם/קהילה מעודפ/ת?', type: 'textarea', required: true },
        { id: 'notSuitable', label: 'מה לא מתאים בכלל?', hint: "מודרני מדי, סגור מדי, שקט מדי ועוד'", type: 'textarea', required: true },
      ],
    },
    page2('פרטים נוספים על בן הזוג שאת מחפשת:'),
  ],
}

export const allFields = (form: RegistrationForm): TallyField[] => form.pages.flatMap((p) => p.fields)

/** Shared by the form and the API route. Returns an error message or null. */
export function validateField(f: TallyField, value: string): string | null {
  const v = value.trim()
  if (f.required && f.type !== 'file' && !v) return 'שדה חובה'
  if (!v) return null
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'כתובת אימייל לא תקינה'
  if (f.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(v)) return 'מספר טלפון לא תקין'
  if (f.numeric && !/^\d{1,3}$/.test(v)) return 'נא להזין מספר'
  if (f.type === 'select' && f.options) {
    const opts = withOther(f.options)
    const items = parseChoices(v)
    if (!f.multi && items.length > 1) return 'בחירה לא תקינה'
    for (const item of items) {
      const base = item.startsWith(OTHER + ': ') ? OTHER : item
      if (!opts.includes(base)) return 'בחירה לא תקינה'
    }
  }
  if (v.length > 2000) return 'הטקסט ארוך מדי'
  return null
}
