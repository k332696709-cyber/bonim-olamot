/**
 * Male registration questionnaire, copied one-to-one from the Tally form
 * "שאלון הכרות 'בונים עולמות' מיועדים" (https://tally.so/r/jalG6J):
 * same questions, same order, same wording, same required flags and the same
 * dropdown options. Two pages, as in Tally.
 */

export type FieldType = 'text' | 'tel' | 'email' | 'textarea' | 'select' | 'file'

export interface TallyField {
  id: string
  label: string
  hint?: string
  type: FieldType
  required: boolean
  options?: string[]
  /** Free-text numeric answers (age, number of children). */
  numeric?: boolean
}

export interface TallyPage {
  heading?: string
  fields: TallyField[]
}

export const FORM_TITLE = "שאלון הכרות 'בונים עולמות' מיועדים"
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

export const MALE_FORM_PAGES: TallyPage[] = [
  {
    fields: [
      { id: 'fullName',   label: 'שם מלא', type: 'text', required: true },
      { id: 'nickname',   label: 'כינוי (אם יש)', type: 'text', required: false },
      { id: 'lastName',   label: 'שם משפחה', type: 'text', required: true },
      { id: 'age',        label: 'גיל', type: 'text', required: true, numeric: true },
      { id: 'birthDate',  label: 'תאריך לידה + עברי', type: 'text', required: true },
      {
        id: 'maritalStatus', label: 'מצב משפחתי', type: 'select', required: true,
        options: ['גרוש עם ילדים', 'רווק', 'גרוש ללא', 'אלמן ללא', 'אלמן עם ילדים'],
      },
      { id: 'childrenCount', label: 'מספר ילדים (גרוש/אלמן עם)', hint: '(אם אין, להקליד 0)', type: 'text', required: true, numeric: true },
      { id: 'edah',       label: 'עדה', type: 'text', required: true },
      { id: 'community',  label: 'השתייכות/קהילה', type: 'text', required: true },
      { id: 'city',       label: 'עיר מגורים (לבד/אצל ההורים)', type: 'text', required: true },
      { id: 'occupation', label: 'עיסוק', type: 'text', required: true },
      { id: 'professionalStudies', label: 'לימודי מקצוע (עבר/כעת/בעתיד)', type: 'textarea', required: true },
      { id: 'studies',    label: 'לימודים (ישיבה קטנה/גדולה/גבוהה)', type: 'textarea', required: true },
      { id: 'framework',  label: 'קביעת עיתים/מסגרת', type: 'textarea', required: true },
      {
        id: 'phoneType', label: 'סוג טלפון שלך', type: 'select', required: true,
        options: ['גם כשר וגם לא מוגן', 'פשוט (כשר)', 'מוגן/מסונן', 'לא כשר', 'גם כשר וגם מוגן'],
      },
      { id: 'phone',      label: 'מספר טלפון', type: 'tel', required: true },
      { id: 'email',      label: 'אימייל', type: 'email', required: true },
      { id: 'photo',      label: 'תמונת שידוכים', type: 'file', required: true },
    ],
  },
  {
    heading: 'פרטים ממוקדים',
    fields: [
      {
        id: 'styleSelf', label: 'איך אתה מגדיר את הסגנון שלך?', type: 'select', required: true,
        options: ['שמור ישיבתי', 'שמור עובד', 'פתוח', 'פתוח במידה', 'מודרני', 'מודרני מאוד'],
      },
      { id: 'styleSelfDetail', label: 'במה זה מתבטא בעיקר? (בלבוש, גישה לטכנולוגיה, רמת חיים, סגנון)', type: 'textarea', required: true },
      {
        id: 'clothingSelf', label: 'סגנון לבוש שלך?', type: 'select', required: true,
        options: ['שבת, אירועים ש"לב, יום חול צבעוני', '(פשוט) רק שחור לבן', 'שחור לבן, עדכני/אלגנטי', 'רק צבעוני', 'אחר'],
      },
      {
        id: 'hatAfterWedding', label: 'כובע לאחר חתונה', type: 'select', required: true,
        options: ['שטריימל', 'קנייטש', 'ספודיק', 'ללא כלל'],
      },
      { id: 'techSelf',   label: 'גישה לטכנולוגיה', type: 'textarea', required: true },
      { id: 'livingSelf', label: 'רמת חיים, סגנון', type: 'textarea', required: true },
      {
        id: 'styleSought', label: 'איזה סגנון אתה מחפש?', type: 'select', required: true,
        options: ['מודרנית מאוד', 'פשוטה/קלאסית', 'פתוחה', 'פתוחה במידה', 'מודרנית'],
      },
      { id: 'styleSoughtDetail', label: 'במה זה מתבטא בעיקר? (בלבוש, גישה לטכנולוגיה, רמת חיים/סגנון)', type: 'textarea', required: true },
      {
        id: 'clothingHer', label: 'סגנון לבוש שלה', type: 'select', required: true,
        options: ['עדכני בסטייל', 'פשוט', 'קלאסי', 'מכובד'],
      },
      {
        id: 'headcoverHer', label: 'כיסוי ראש שלה לאחר חתונה', type: 'select', required: true,
        options: [
          "פאה עם כיסוי (סרט/קשת וכו')",
          'פאה טופ לייס/ללא תספורת',
          'פאה טופ לייס/עם תספורת',
          'רק פאה',
          'רק מטפחת',
          'פאה/מטפחת ללא עדיפות',
        ],
      },
      { id: 'techHer',    label: 'גישה שלה לטכנולוגיה', type: 'textarea', required: true },
      { id: 'livingHer',  label: 'רמת חיים/סגנון שלה', type: 'textarea', required: true },
      { id: 'traits',     label: 'מה מאפיין אותך במיוחד?', hint: "רגוע/יוזם/ביישן ועוד' (נא לכתוב מספר מאפיינים)", type: 'textarea', required: true },
      { id: 'brings',     label: 'מה אתה מביא לנישואים?', hint: "יציבות/עומק/אמינות ועוד' (נא לכתוב מספר דברים)", type: 'textarea', required: true },
      { id: 'edahSought', label: 'עדה/זרם/קהילה מעודפ/ת?', type: 'textarea', required: true },
      { id: 'notSuitable', label: 'מה לא מתאים בכלל?', hint: "מודרנית מדי, סגורה מדי, שקטה מדי ועוד'", type: 'textarea', required: true },
    ],
  },
]

export const ALL_MALE_FIELDS: TallyField[] = MALE_FORM_PAGES.flatMap((p) => p.fields)

/** Server + client validation shared by both sides. Returns an error message or null. */
export function validateField(f: TallyField, value: string): string | null {
  const v = value.trim()
  if (f.required && f.type !== 'file' && !v) return 'שדה חובה'
  if (!v) return null
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'כתובת אימייל לא תקינה'
  if (f.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(v)) return 'מספר טלפון לא תקין'
  if (f.numeric && !/^\d{1,3}$/.test(v)) return 'נא להזין מספר'
  if (f.type === 'select' && f.options && !f.options.includes(v)) return 'בחירה לא תקינה'
  if (v.length > 2000) return 'הטקסט ארוך מדי'
  return null
}
