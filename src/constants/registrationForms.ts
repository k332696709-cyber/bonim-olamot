/**
 * Registration questionnaires copied one-to-one from the Tally forms:
 *   male   – https://tally.so/r/jalG6J  "שאלון הכרות 'בונים עולמות' מיועדים"
 *   female – https://tally.so/r/9q72VY  "שאלון הכרות 'בונים עולמות' מיועדות"
 * Same questions, order, wording, required flags, dropdown options and the
 * same two pages. Only obvious typos were fixed (noted inline).
 */

import { COMMUNITY_OPTIONS, CITY_OPTIONS, EDAH_OPTIONS, HASIDIC, HASIDUT_OPTIONS, HOUSING_OPTIONS } from '@/constants/communityLists'
import { ageFromBirthDate, parseBirthDate } from '@/lib/registration/birthDate'

export type FieldType = 'text' | 'tel' | 'email' | 'textarea' | 'select' | 'file' | 'combo' | 'birthdate' | 'toggle' | 'agerange'

export interface TallyField {
  id: string
  label: string
  hint?: string
  type: FieldType
  required: boolean
  options?: string[]
  /** Several options may be chosen (stored joined with " | "). */
  multi?: boolean
  /** Highest number of choices (multi fields). */
  max?: number
  /** Show the options as small tick boxes, even when the list could be a dropdown. */
  chips?: boolean
  /** Choices as a list of small circles that get a tick when chosen. */
  circles?: boolean
  /** Shown in its own separate box above the other questions. */
  ownBox?: boolean
  /** The list is closed: no "other" choice is added. */
  noOther?: boolean
  /** The person may add their own entries next to the listed options (no "other" chip then). */
  custom?: boolean
  /** Short numeric free-text answers (age, number of children). */
  numeric?: boolean
  /** Section heading rendered above this field. */
  sectionBefore?: string
  /** The field is shown only when another field's answer includes this text. */
  visibleWhen?: { id: string; includes: string | string[] }
  /** Contact boxes beyond the first three appear only after the person asks for more (the number of the box). */
  group?: number
}

/** Whether a field applies, given the answers so far (some questions only follow another answer). */
export function isFieldVisible(f: TallyField, answers: Record<string, string>): boolean {
  if (!f.visibleWhen) return true
  const have = answers[f.visibleWhen.id] ?? ''
  const wanted = Array.isArray(f.visibleWhen.includes) ? f.visibleWhen.includes : [f.visibleWhen.includes]
  return wanted.some((w) => have.includes(w))
}

export interface TallyPage {
  fields: TallyField[]
  /** The short registration, or a step of the questionnaire that follows it. */
  stage?: 'register' | 'questionnaire'
  title?: string
  intro?: string
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

const TRAITS_MALE = ['רגוע', 'שמח', 'רציני', 'זורם', 'עמוק', 'חברותי', 'יוזם', 'ביישן', 'תקשורתי', 'אחראי', 'סבלני', 'אופטימי', 'חם', 'צנוע', 'יצירתי', 'מסודר', 'בעל חוש הומור', 'נותן', 'עצמאי', 'רגיש', 'נעים', 'מעשי']
const TRAITS_FEMALE = ['רגועה', 'שמחה', 'רצינית', 'זורמת', 'עמוקה', 'חברותית', 'יוזמת', 'ביישנית', 'תקשורתית', 'אחראית', 'סבלנית', 'אופטימית', 'חמה', 'צנועה', 'יצירתית', 'מסודרת', 'בעלת חוש הומור', 'נותנת', 'עצמאית', 'רגישה', 'נעימה', 'מעשית']
const BRINGS = ['יציבות', 'עומק', 'אמינות', 'אחריות', 'מחויבות', 'רגש', 'ביתיות', 'קלילות ושמחה', 'תקשורת', 'נאמנות', 'תמיכה', 'סבלנות', 'יושרה', 'חיבור לתורה ולערכים', 'יוזמה', 'יציבות כלכלית', 'מקצועיות והשכלה', 'הומור']
const FAMILY_MALE = ['רווק', 'גרוש ללא', 'גרוש עם ילדים', 'אלמן ללא', 'אלמן עם ילדים']
const FAMILY_FEMALE = ['רווקה', 'גרושה ללא', 'גרושה עם ילדים', 'אלמנה ללא', 'אלמנה עם ילדים']
/** What "access to technology" means, from the strictest to the most open. */
const TECH_OPTIONS = [
  'אין אינטרנט, לא בבית ולא בטלפון',
  'אינטרנט מסונן לצורכי פרנסה או לימודים בלבד',
  'אינטרנט מסונן בבית ובטלפון',
  'אינטרנט רגיל, בשימוש מבוקר',
  'שימוש חופשי בטכנולוגיה',
]
/** What "standard of living and style" means, from the most modest to the most spacious. */
const LIVING_OPTIONS = [
  'פשוט וצנוע, חיים בצמצום ובלי מותרות',
  'מסודר ונוח, בלי פינוקים מיותרים',
  'נוח עם פינוקים, יציאות וחופשה בארץ מדי פעם',
  'רחב, חופשות ויציאות קבועות ובית מרווח',
]
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

/** Contact people for inquiries: name, relation and phone. The first three boxes are always shown, more can be added. */
const REF_COUNT = 10
function refFields(): TallyField[] {
  const out: TallyField[] = []
  for (let n = 1; n <= REF_COUNT; n++) {
    const extra = n > 3 ? { group: n } : {}
    out.push({ id: `ref${n}Name`, label: 'שם:', type: 'text', required: n === 1, ...(n === 1 ? { sectionBefore: 'מספרים לבירורים' } : {}), ...extra })
    out.push({ id: `ref${n}Relation`, label: 'מה הקשר אליך?', type: 'text', required: false, ...extra })
    out.push({ id: `ref${n}Phone`, label: 'טלפון:', type: 'tel', required: n === 1, ...extra })
  }
  return out
}
const REF_IDS = refFields().map((f) => f.id)

/** Page 2 is identical in both forms except the partner question wording. */
const page2 = (partnerLabel: string): TallyPage => ({
  fields: [
    { id: 'ageRange', label: 'טווח גילאים', hint: 'מאיזה גיל ועד איזה גיל', type: 'agerange', required: true, sectionBefore: 'פרטים חשובים לשדכנים' },
    { id: 'medical',  label: 'מצב רפואי/נפשי', type: 'select', required: true, options: ['תקין', 'יש בעיה קלה', 'מצב מאתגר'] },
    { id: 'medicalDetail', label: 'בעיה רפואית/נפשית', type: 'textarea', required: false, visibleWhen: { id: 'medical', includes: ['בעיה קלה', 'מאתגר', 'אחר'] } },
    { id: 'parents',  label: 'מצב ההורים', type: 'select', required: true, options: ['נשואים', 'גרושים', 'אלמנ/ה'] },
    { id: 'houseStyle', label: 'סגנון הבית', type: 'select', required: true, options: HOUSE_STYLE },
    { id: 'aboutMe',  label: 'פרטים נוספים שהיית רוצה להוסיף על עצמך:', type: 'textarea', required: false },
    { id: 'aboutPartner', label: partnerLabel, type: 'textarea', required: true },
    ...refFields(),
  ],
})

const BASE_MALE: RegistrationForm = {
  gender: 'male',
  title: "שאלון הכרות 'בונים עולמות' מיועדים",
  pages: [
    {
      fields: [
        { id: 'fullName',  label: 'שם מלא', type: 'text', required: true },
        { id: 'nickname',  label: 'כינוי (אם יש)', type: 'text', required: false },
        { id: 'lastName',  label: 'שם משפחה', type: 'text', required: true },
        { id: 'birthDate', label: 'תאריך לידה', hint: 'בוחרים מהלוח. התאריך העברי והגיל מתמלאים לבד.', type: 'birthdate', required: true },
        { id: 'maritalStatus', label: 'מצב משפחתי', type: 'select', required: true, options: FAMILY_MALE },
        { id: 'childrenCount', label: 'כמה ילדים?', type: 'text', required: true, numeric: true, visibleWhen: { id: 'maritalStatus', includes: 'עם ילדים' } },
        { id: 'edah',      label: 'עדה', type: 'select', multi: true, required: true, options: EDAH_OPTIONS },
        { id: 'community', label: 'זרם וקהילה', type: 'select', required: true, options: COMMUNITY_OPTIONS },
        { id: 'hasidut',   label: 'איזו חסידות?', hint: 'אפשר לבחור מהרשימה או להקליד.', type: 'combo', required: false, options: HASIDUT_OPTIONS, visibleWhen: { id: 'community', includes: HASIDIC } },
        { id: 'city',      label: 'עיר מגורים', hint: 'מקלידים כמה אותיות ובוחרים מהרשימה.', type: 'combo', required: true, options: Array.from(new Set(CITY_OPTIONS)) },
        { id: 'housing',   label: 'מגורים', type: 'select', required: true, options: HOUSING_OPTIONS },
        { id: 'occupation', label: 'עיסוק', type: 'text', required: true },
        { id: 'professionalStudies', label: 'לימודי מקצוע (עבר/כעת/בעתיד)', type: 'textarea', required: true },
        { id: 'yeshivaKtana', label: 'ישיבה קטנה', hint: 'שם הישיבה והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false, sectionBefore: 'לימודים' },
        { id: 'yeshivaGdola', label: 'ישיבה גדולה', hint: 'שם הישיבה והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false },
        { id: 'yeshivaGvoha', label: 'ישיבה גבוהה', hint: 'שם הישיבה והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false },
        { id: 'framework', label: 'קביעת עיתים/מסגרת', type: 'textarea', required: true },
        { id: 'phoneType', label: 'סוג טלפון שלך', type: 'select', required: true, options: PHONE_TYPES },
        { id: 'phone',     label: 'מספר טלפון', type: 'tel', required: true },
        { id: 'email',     label: 'אימייל', type: 'email', required: true },
        { id: 'photo',     label: 'תמונות שידוכים (עד 5)', type: 'file', required: true, hint: 'אפשר להעלות עד 5 תמונות. התמונה הראשונה היא הראשית.' },
        {
          id: 'styleSelf', label: 'איך אתה מגדיר את הסגנון שלך?', type: 'select', multi: true, required: true, sectionBefore: 'פרטים ממוקדים',
          options: ['שמור ישיבתי', 'שמור עובד', 'פתוח', 'פתוח במידה', 'מודרני', 'מודרני מאוד'],
        },
        {
          id: 'clothingSelf', label: 'סגנון לבוש שלך?', type: 'select', multi: true, required: true,
          options: ['(פשוט) רק שחור לבן', 'שחור לבן, עדכני/אלגנטי', 'שבת, אירועים ש"לב, יום חול צבעוני', 'רק צבעוני', 'אחר'],
        },
        { id: 'hatAfterWedding', label: 'כובע לאחר חתונה', type: 'select', multi: true, required: true, options: ['קנייטש', 'שטריימל', 'ספודיק', 'סאמט', 'ללא כלל', 'אחר'] },
        { id: 'techSelf',   label: 'גישה לטכנולוגיה', hint: 'בוחרים את ההגדרה שהכי מתאימה לכם.', type: 'select', required: true, options: TECH_OPTIONS },
        { id: 'livingSelf', label: 'רמת חיים, סגנון', hint: 'בוחרים את ההגדרה שהכי מתאימה לכם.', type: 'select', required: true, options: LIVING_OPTIONS },
        {
          id: 'styleSought', label: 'איזה סגנון אתה מחפש?', type: 'select', multi: true, required: true,
          options: ['פשוטה/קלאסית', 'פתוחה', 'פתוחה במידה', 'מודרנית', 'מודרנית מאוד'],
        },
        {
          id: 'clothingHer', label: 'סגנון לבוש שלה', type: 'select', multi: true, required: true,
          options: ['פשוט', 'קלאסי', 'עדכני בסטייל', 'מכובד', 'מודרני', 'מודרני מאוד'],
        },
        { id: 'headcoverHer', label: 'כיסוי ראש שלה לאחר חתונה', type: 'select', multi: true, required: true, options: [...HEADCOVER, 'אחר'] },
        { id: 'techHer',    label: 'גישה שלה לטכנולוגיה', hint: 'אפשר לבחור כמה הגדרות שמתאימות לכם.', type: 'select', multi: true, required: true, options: TECH_OPTIONS },
        { id: 'livingHer',  label: 'רמת חיים/סגנון שלה', hint: 'אפשר לבחור כמה הגדרות שמתאימות לכם.', type: 'select', multi: true, required: true, options: LIVING_OPTIONS },
        { id: 'traits',     label: 'מה מאפיין אותך במיוחד?', hint: 'אפשר לבחור כמה שרוצים, ולהוסיף משלכם', type: 'select', multi: true, custom: true, required: true, options: TRAITS_MALE },
        { id: 'brings',     label: 'מה אתה מביא לנישואים?', hint: 'אפשר לבחור כמה שרוצים, ולהוסיף משלכם', type: 'select', multi: true, custom: true, required: true, options: BRINGS },
        { id: 'edahSought', label: 'עדה/זרם/קהילה מעודפ/ת?', type: 'textarea', required: true },
        { id: 'notSuitable', label: 'מה לא מתאים בכלל?', hint: "מודרנית מדי, סגורה מדי, שקטה מדי ועוד'", type: 'textarea', required: true },
      ],
    },
    page2('פרטים נוספים על בת הזוג שאתה מחפש:'),
  ],
}

const BASE_FEMALE: RegistrationForm = {
  gender: 'female',
  title: "שאלון הכרות 'בונים עולמות' מיועדות",
  pages: [
    {
      fields: [
        { id: 'fullName',  label: 'שם מלא', type: 'text', required: true },
        { id: 'nickname',  label: 'כינוי (אם יש)', type: 'text', required: false },
        { id: 'lastName',  label: 'שם משפחה', type: 'text', required: true },
        { id: 'birthDate', label: 'תאריך לידה', hint: 'בוחרים מהלוח. התאריך העברי והגיל מתמלאים לבד.', type: 'birthdate', required: true },
        { id: 'maritalStatus', label: 'מצב משפחתי', type: 'select', required: true, options: FAMILY_FEMALE },
        { id: 'childrenCount', label: 'כמה ילדים?', type: 'text', required: true, numeric: true, visibleWhen: { id: 'maritalStatus', includes: 'עם ילדים' } },
        { id: 'edah',      label: 'עדה', type: 'select', multi: true, required: true, options: EDAH_OPTIONS },
        { id: 'community', label: 'זרם וקהילה', type: 'select', required: true, options: COMMUNITY_OPTIONS },
        { id: 'hasidut',   label: 'איזו חסידות?', hint: 'אפשר לבחור מהרשימה או להקליד.', type: 'combo', required: false, options: HASIDUT_OPTIONS, visibleWhen: { id: 'community', includes: HASIDIC } },
        { id: 'city',      label: 'עיר מגורים', hint: 'מקלידים כמה אותיות ובוחרים מהרשימה.', type: 'combo', required: true, options: Array.from(new Set(CITY_OPTIONS)) },
        { id: 'housing',   label: 'מגורים', type: 'select', required: true, options: HOUSING_OPTIONS },
        { id: 'occupation', label: 'עיסוק', type: 'text', required: true },
        { id: 'professionalStudies', label: 'לימודי מקצוע (עבר/כעת/בעתיד)', type: 'textarea', required: true },
        { id: 'highSchool', label: 'תיכון', hint: 'שם המוסד והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false, sectionBefore: 'לימודים' },
        { id: 'seminary', label: 'סמינר', hint: 'שם המוסד והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false },
        { id: 'midrasha', label: 'מדרשה', hint: 'שם המוסד והשנים. אפשר להשאיר ריק אם לא רלוונטי.', type: 'text', required: false },
        { id: 'phoneType', label: 'סוג טלפון שלך', type: 'select', required: true, options: PHONE_TYPES },
        { id: 'phone',     label: 'מספר טלפון', type: 'tel', required: true },
        { id: 'email',     label: 'אימייל', type: 'email', required: true },
        { id: 'photo',     label: 'תמונות שידוכים (עד 5)', type: 'file', required: true, hint: 'אפשר להעלות עד 5 תמונות. התמונה הראשונה היא הראשית.' },
        {
          id: 'styleSelf', label: 'איך את מגדירה את הסגנון שלך?', type: 'select', multi: true, required: true,
          options: ['שמורה', 'פתוחה', 'פתוחה במידה', 'מודרנית', 'מודרנית מאוד'],
        },
        {
          id: 'clothingSelf', label: 'סגנון לבוש שלך', type: 'select', multi: true, required: true,
          options: ['פשוט', 'קלאסי', 'עדכני בסטייל', 'מכובד', 'מודרני', 'מודרני מאוד'],
        },
        { id: 'headcoverSelf', label: 'כיסוי ראש לאחר חתונה', type: 'select', multi: true, required: true, options: HEADCOVER },
        { id: 'techSelf',   label: 'גישה לטכנולוגיה', hint: 'בוחרים את ההגדרה שהכי מתאימה לכם.', type: 'select', required: true, options: TECH_OPTIONS },
        { id: 'livingSelf', label: 'רמת חיים/סגנון', hint: 'בוחרים את ההגדרה שהכי מתאימה לכם.', type: 'select', required: true, options: LIVING_OPTIONS },
        {
          id: 'styleSought', label: 'איזה סגנון את מחפשת?', type: 'select', multi: true, required: true,
          options: ['שמור/ישיבתי', 'שמור/עובד', 'פתוח', 'פתוח במידה', 'מודרני', 'מודרני מאוד'],
        },
        // Tally's original is missing the closing parenthesis here; added.
        {
          id: 'clothingHim', label: 'סגנון לבוש שלו', type: 'select', multi: true, required: true,
          options: ['רק שחור לבן', 'שחור לבן. אלגנטי/עדכני', 'שחור לבן שבת ואירועים, יום חול צבעוני', 'רק צבעוני'],
        },
        { id: 'hatHim',     label: 'כובע אחרי חתונה', type: 'select', multi: true, required: true, options: ['כובע קנייטש', 'שטריימל', 'ספודיק', 'סאמט', 'ללא כובע כלל'] },
        { id: 'techHim',    label: 'גישה שלו לטכנולוגיה', hint: 'אפשר לבחור כמה הגדרות שמתאימות לכם.', type: 'select', multi: true, required: true, options: TECH_OPTIONS },
        { id: 'livingHim',  label: 'רמת חיים/סגנון שלו', hint: 'אפשר לבחור כמה הגדרות שמתאימות לכם.', type: 'select', multi: true, required: true, options: LIVING_OPTIONS },
        { id: 'traits',     label: 'מה מאפיין אותך במיוחד?', hint: 'אפשר לבחור כמה שרוצים, ולהוסיף משלכם', type: 'select', multi: true, custom: true, required: true, options: TRAITS_FEMALE },
        { id: 'brings',     label: 'מה את מביאה לנשואים?', hint: 'אפשר לבחור כמה שרוצים, ולהוסיף משלכם', type: 'select', multi: true, custom: true, required: true, options: BRINGS },
        { id: 'edahSought', label: 'עדה/זרם/קהילה מעודפ/ת?', type: 'textarea', required: true },
        { id: 'notSuitable', label: 'מה לא מתאים בכלל?', hint: "מודרני מדי, סגור מדי, שקט מדי ועוד'", type: 'textarea', required: true },
      ],
    },
    page2('פרטים נוספים על בן הזוג שאת מחפשת:'),
  ],
}

/**
 * The site now asks in two stages. The short registration (name, birth date, status, background,
 * where they live, contact, photos) opens the account. The questionnaire that follows gets to know the
 * person beyond the resume; the profile is shown to matchmakers only once it is 100% complete.
 */
const REGISTER_IDS = [
  'fullName', 'nickname', 'lastName', 'birthDate', 'maritalStatus', 'childrenCount', 'edah', 'community',
  'hasidut', 'city', 'housing', 'occupation', 'phone', 'email', 'photo',
]

const g = (gender: 'male' | 'female', m: string, f: string) => (gender === 'male' ? m : f)

/** Whether the phone number has WhatsApp, so a matchmaker knows how to reach the person. */
function whatsappFields(): TallyField[] {
  return [
    {
      id: 'whatsapp', label: 'יש וואטסאפ על המספר הזה?', type: 'select', required: true, chips: true, circles: true, noOther: true,
      options: ['כן, יש וואטסאפ על המספר הזה', 'לא, יש וואטסאפ על מספר אחר', 'אין לי וואטסאפ בכלל'],
    },
    { id: 'whatsappNumber', label: 'מספר הוואטסאפ', type: 'tel', required: true, visibleWhen: { id: 'whatsapp', includes: 'מספר אחר' } },
  ]
}

/** Whether updates may also come by SMS and by phone call. Off until the person switches them on. */
function notifyFields(): TallyField[] {
  return [
    {
      id: 'notifySms', label: 'קבלת מסרונים (SMS)', type: 'toggle', required: false,
      sectionBefore: 'הודעות בטלפון ובמסרון',
      hint: 'פעיל: יישלח אליך מסרון כשיש עדכון בתיק שלך, למשל עניין הדדי או הצעות חדשות. עדכונים יגיעו גם במייל.',
    },
    {
      id: 'notifyCalls', label: 'קבלת שיחות טלפון', type: 'toggle', required: false,
      hint: 'פעיל: ייתכן שנתקשר אליך כדי לעדכן על התיק שלך.',
    },
  ]
}

/** Asked first: sometimes a parent or a matchmaker fills in the card for the candidate. */
function whoFills(gender: 'male' | 'female'): TallyField[] {
  return [
    {
      id: 'filledBy', label: 'מי ממלא את הכרטיס עכשיו?', hint: 'אפשר שההורים או אדם אחר ימלאו בשם ' + g(gender, 'המיועד', 'המיועדת') + '. כך נדע למי לפנות.',
      type: 'select', required: true, chips: true, circles: true, noOther: true, ownBox: true,
      options: ['אני בעצמי', 'אחד ההורים', 'אדם אחר (שדכן/ית, קרוב/ת משפחה, מכר/ה)'],
    },
    { id: 'fillerContact', label: 'שם וטלפון של מי שממלא', hint: 'לא חובה. כך נוכל ליצור קשר גם איתו.', type: 'text', required: false, ownBox: true, visibleWhen: { id: 'filledBy', includes: ['הורים', 'אדם אחר'] } },
  ]
}

/** Questions that look past the resume. Same for both, with wording for each. */
function newQuestions(gender: 'male' | 'female'): Record<string, TallyField[]> {
  return {
    prof: [
      { id: 'profWhen', label: 'לימודי מקצוע', hint: 'אפשר לבחור יותר מאחת. מי שלא למד מקצוע יכול לדלג.', type: 'select', multi: true, chips: true, noOther: true, required: false, options: ['עבר', 'כעת', 'בעתיד'] },
      { id: 'profPast', label: 'לימודי מקצוע בעבר: איזה מקצוע?', type: 'text', required: true, visibleWhen: { id: 'profWhen', includes: 'עבר' } },
      { id: 'profNow', label: 'לימודי מקצוע כעת: איזה מקצוע?', type: 'text', required: true, visibleWhen: { id: 'profWhen', includes: 'כעת' } },
      { id: 'profFuture', label: 'לימודי מקצוע בעתיד: איזה מקצוע?', type: 'text', required: true, visibleWhen: { id: 'profWhen', includes: 'בעתיד' } },
    ],
    lifestyle: [
      { id: 'weekend', label: 'איך נראה סוף שבוע אצלך?', type: 'select', required: true, options: ['בבית בשקט', 'אצל המשפחה', 'מארחים ומתארחים', 'טיולים', 'מעורב'] },
      { id: 'vacations', label: 'חופשות', type: 'select', required: true, options: ['פעם בשנה בחו"ל', 'חופשה בארץ', 'יציאות קצרות', 'לא מרבים לצאת', 'לא חשוב'] },
      { id: 'outings', label: 'יציאות', type: 'select', multi: true, required: true, options: ['מסעדות', 'טיולים', 'בבית', 'תרבות ומוזיקה', 'לא מרבים'] },
      { id: 'hobbies', label: 'תחביבים', hint: 'אפשר לבחור כמה שרוצים, ולהוסיף משלכם', type: 'select', multi: true, custom: true, required: true, options: ['ספורט', 'קריאה', 'מוזיקה', 'בישול', 'טיולים', 'יצירה', 'התנדבות', 'לימוד', 'צילום', 'גינון'] },
      { id: 'money', label: g(gender, 'איך אתה מתנהל עם כסף?', 'איך את מתנהלת עם כסף?'), type: 'select', required: true, options: ['חסכוני', 'מאוזן', 'נוח', 'לא חשוב'] },
      { id: 'torahAfter', label: g(gender, 'לימוד תורה אחרי החתונה', 'לימוד התורה של בן הזוג אחרי החתונה'), type: 'select', required: true, options: ['קביעות עיתים', 'חצי עובד חצי לומד', 'לימוד בכולל', 'לא רלוונטי'] },
      { id: 'livePlace', label: g(gender, 'איפה תרצה לגור אחרי החתונה?', 'איפה תרצי לגור אחרי החתונה?'), type: 'select', required: true, options: ['בעיר מגורי', 'קרוב לעיר מגורי', 'בישראל', 'בחו"ל', 'עדיפות בישראל, אבל פתוח לשמוע גם בחו"ל'] },
      { id: 'homeValues', label: 'מה הכי חשוב לך בבית שלכם?', type: 'select', multi: true, required: true, options: ['שקט', 'אירוח', 'מסורת', 'צחוק ואווירה', 'סדר'] },
      { id: 'kidsWanted', label: 'כמה ילדים בערך?', type: 'select', required: true, options: ['1 עד 2', '3 עד 4', '5 עד 6', '7 עד 8', "כמה שה' ייתן", 'מעדיפ/ה לא לענות'] },
    ],
    personality: [
      { id: 'personalityMix', label: 'מה יותר מתאר אותך?', type: 'select', multi: true, required: true, options: ['מוחצן', 'מופנם', 'מסודר', 'ספונטני', 'רציני', 'מצחיק', 'שקט', 'חברותי'] },
    ],
    more: [
      { id: 'friendsWords', label: g(gender, 'איך חברים היו מתארים אותך בשלוש מילים?', 'איך חברות היו מתארות אותך בשלוש מילים?'), type: 'text', required: true },
      { id: 'mustKnow', label: 'מה חשוב לך שהצד השני ידע עליך?', type: 'textarea', required: false },
    ],
  }
}

const STEPS: { title: string; intro?: string; ids: string[]; lead?: 'prof'; extra?: 'lifestyle' | 'personality' | 'more' }[] = [
  { title: 'קצת עליך', intro: 'לימודים, עיסוק ומסגרת.', lead: 'prof', ids: ['yeshivaKtana', 'yeshivaGdola', 'yeshivaGvoha', 'highSchool', 'seminary', 'midrasha', 'framework', 'phoneType'] },
  { title: 'הסגנון שלך', intro: 'איך אתם מגדירים את עצמכם.', ids: ['styleSelf', 'clothingSelf', 'hatAfterWedding', 'headcoverSelf', 'techSelf', 'livingSelf'] },
  { title: 'מה מאפיין אותך', intro: 'האופי שלך ומה אתם מביאים.', ids: ['traits', 'brings'], extra: 'personality' },
  { title: 'אורח חיים', intro: 'איך נראים החיים שלכם ומה חשוב לכם בבית.', ids: [], extra: 'lifestyle' },
  { title: 'מה אתם מחפשים', intro: 'הצד השני שאתם מחפשים.', ids: ['styleSought', 'clothingHer', 'clothingHim', 'headcoverHer', 'hatHim', 'techHer', 'techHim', 'livingHer', 'livingHim', 'edahSought', 'ageRange', 'notSuitable', 'aboutPartner'] },
  { title: 'עוד עליך', intro: 'כמה דברים אחרונים, ומספרים לבירורים.', ids: ['medical', 'medicalDetail', 'parents', 'houseStyle', 'aboutMe', ...REF_IDS], extra: 'more' },
]

/** Questions that were replaced by newer ones (their old answers stay stored). */
const RETIRED = new Set(['professionalStudies', 'country'])

function buildForm(base: RegistrationForm): RegistrationForm {
  const all = base.pages.flatMap((p) => p.fields).filter((f) => !RETIRED.has(f.id))
  const byId = new Map(all.map((f) => [f.id, f]))
  const used = new Set<string>()
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((f): f is TallyField => !!f).map((f) => { used.add(f.id); return f })

  const reg = pick(REGISTER_IDS)
  const phoneAt = reg.findIndex((f) => f.id === 'phone')
  reg.splice(phoneAt + 1, 0, ...whatsappFields(), ...notifyFields())
  const registerFields = [...whoFills(base.gender), ...reg]
  const extras = newQuestions(base.gender)
  const steps: TallyPage[] = STEPS.map((st) => ({
    stage: 'questionnaire' as const,
    title: st.title,
    intro: st.intro,
    fields: [...(st.lead ? extras[st.lead] : []), ...pick(st.ids), ...(st.extra ? extras[st.extra] : [])],
  }))
  // Anything not placed above still shows up, in the last step.
  const leftover = all.filter((f) => !used.has(f.id))
  if (leftover.length) steps[steps.length - 1].fields.push(...leftover)

  return {
    gender: base.gender,
    title: base.title,
    pages: [{ stage: 'register', title: 'הרשמה', fields: registerFields }, ...steps],
  }
}

export const MALE_FORM: RegistrationForm = buildForm(BASE_MALE)
export const FEMALE_FORM: RegistrationForm = buildForm(BASE_FEMALE)

export const allFields = (form: RegistrationForm): TallyField[] => form.pages.flatMap((p) => p.fields)
export const registerFields = (form: RegistrationForm): TallyField[] =>
  form.pages.filter((p) => p.stage === 'register').flatMap((p) => p.fields)
export const questionnairePages = (form: RegistrationForm): TallyPage[] => form.pages.filter((p) => p.stage === 'questionnaire')

/** Shared by the form and the API route. Returns an error message or null. */
export function validateField(f: TallyField, value: string): string | null {
  const v = value.trim()
  if (f.required && f.type !== 'file' && !v) return 'שדה חובה'
  if (!v) return null
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'כתובת אימייל לא תקינה'
  if (f.type === 'tel' && !/^[0-9+\-\s()]{7,20}$/.test(v)) return 'מספר טלפון לא תקין'
  if (f.numeric && !/^\d{1,3}$/.test(v)) return 'נא להזין מספר'
  if (f.type === 'birthdate') {
    if (!parseBirthDate(v)) return 'נא לבחור תאריך לידה מהלוח'
    const age = ageFromBirthDate(v)
    if (age === null || age < 18) return 'ההרשמה מגיל 18 ומעלה'
    if (age > 99) return 'נא לבדוק את תאריך הלידה'
  }
  if (f.type === 'combo' && v.length > 80) return 'הטקסט ארוך מדי'
  if (f.type === 'toggle' && v !== '1' && v !== '0') return 'בחירה לא תקינה'
  if (f.type === 'agerange') {
    const nums = v.match(/[0-9]{2,3}/g) ?? []
    if (nums.length < 2) return 'נא לבחור גם מגיל וגם עד גיל'
    if (Number(nums[0]) > Number(nums[1])) return 'הגיל הראשון צריך להיות קטן מהשני'
  }
  if (f.type === 'select' && f.custom) {
    const items = parseChoices(v)
    if (f.max && items.length > f.max) return `אפשר לבחור עד ${f.max}`
    if (items.some((x) => x.length > 60)) return 'אחת הבחירות ארוכה מדי'
    return null
  }
  if (f.type === 'select' && f.options) {
    const opts = f.noOther ? f.options : withOther(f.options)
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
