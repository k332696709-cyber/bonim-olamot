export interface Option<T extends string = string> {
  value: T
  he: string
  en: string
}

// ─── Male Style ───────────────────────────────────────────────────────────────

export const MALE_STYLE_OPTIONS: Option[] = [
  { value: 'yeshivish',   he: 'ישיבתי',        en: 'Yeshivish' },
  { value: 'open_ish',    he: 'פתוח במידה',    en: 'Open-ish' },
  { value: 'open',        he: 'פתוח',           en: 'Open' },
  { value: 'modern',      he: 'מודרני',         en: 'Modern' },
  { value: 'very_modern', he: 'מודרני מאוד',   en: 'Very Modern' },
]

export const MALE_PARTNER_STYLE_OPTIONS: Option[] = [
  { value: 'closed',      he: 'סגורה',          en: 'Closed' },
  { value: 'open',        he: 'פתוחה',          en: 'Open' },
  { value: 'open_ish',    he: 'פתוחה במידה',   en: 'Open-ish' },
  { value: 'modern',      he: 'מודרנית',        en: 'Modern' },
  { value: 'very_modern', he: 'מודרנית מאוד',  en: 'Very Modern' },
]

// ─── Female Style ─────────────────────────────────────────────────────────────

export const FEMALE_STYLE_OPTIONS: Option[] = [
  { value: 'shmura',      he: 'שמורה',          en: 'Shmura' },
  { value: 'open_ish',    he: 'פתוחה במידה',   en: 'Open-ish' },
  { value: 'open',        he: 'פתוחה',          en: 'Open' },
  { value: 'modern',      he: 'מודרנית',        en: 'Modern' },
  { value: 'very_modern', he: 'מודרנית מאוד',  en: 'Very Modern' },
]

export const FEMALE_PARTNER_STYLE_OPTIONS: Option[] = [
  { value: 'shmur',       he: 'שמור',           en: 'Shmur' },
  { value: 'open_ish',    he: 'פתוח במידה',    en: 'Open-ish' },
  { value: 'open',        he: 'פתוח',           en: 'Open' },
  { value: 'modern',      he: 'מודרני',         en: 'Modern' },
  { value: 'very_modern', he: 'מודרני מאוד',   en: 'Very Modern' },
]

// ─── Traits ───────────────────────────────────────────────────────────────────

export const TRAIT_OPTIONS_MALE: Option[] = [
  { value: 'calm',          he: 'רגוע',        en: 'Calm' },
  { value: 'happy',         he: 'שמח',         en: 'Happy' },
  { value: 'serious',       he: 'רציני',       en: 'Serious' },
  { value: 'flowing',       he: 'זורם',        en: 'Flowing' },
  { value: 'deep',          he: 'עמוק',        en: 'Deep' },
  { value: 'social',        he: 'חברותי',      en: 'Social' },
  { value: 'proactive',     he: 'יוזם',        en: 'Proactive' },
  { value: 'shy',           he: 'ביישן',       en: 'Shy' },
  { value: 'communicative', he: 'תקשורתי',    en: 'Communicative' },
]

export const TRAIT_OPTIONS_FEMALE: Option[] = [
  { value: 'calm',          he: 'רגועה',       en: 'Calm' },
  { value: 'happy',         he: 'שמחה',        en: 'Happy' },
  { value: 'serious',       he: 'רצינית',      en: 'Serious' },
  { value: 'flowing',       he: 'זורמת',       en: 'Flowing' },
  { value: 'deep',          he: 'עמוקה',       en: 'Deep' },
  { value: 'social',        he: 'חברותית',     en: 'Social' },
  { value: 'proactive',     he: 'יוזמת',       en: 'Proactive' },
  { value: 'shy',           he: 'ביישנית',     en: 'Shy' },
  { value: 'communicative', he: 'תקשורתית',   en: 'Communicative' },
]

// ─── Relationship Values ──────────────────────────────────────────────────────

export const RELATIONSHIP_VALUES_MALE: Option[] = [
  { value: 'stability',        he: 'יציבות',                  en: 'Stability' },
  { value: 'emotional',        he: 'פתיחות רגשית',            en: 'Emotional Openness' },
  { value: 'aspirations',      he: 'שאיפות והתפתחות',         en: 'Aspirations & Growth' },
  { value: 'family',           he: 'משפחתיות',                en: 'Family-oriented' },
  { value: 'homey',            he: 'ביתיות',                  en: 'Homey' },
  { value: 'depth',            he: 'עומק ושיחות',             en: 'Depth & Conversations' },
  { value: 'lightness',        he: 'קלילות',                  en: 'Lightness' },
  { value: 'spiritual',        he: 'שאיפות רוחניות',          en: 'Spiritual Aspirations' },
  { value: 'worldview',        he: 'השקפת חיים דומה',         en: 'Similar Worldview' },
]

export const RELATIONSHIP_VALUES_FEMALE: Option[] = [
  { value: 'stability',        he: 'יציבות',                  en: 'Stability' },
  { value: 'emotional',        he: 'פתיחות רגשית',            en: 'Emotional Openness' },
  { value: 'aspirations',      he: 'שאיפות והתפתחות',         en: 'Aspirations & Growth' },
  { value: 'family',           he: 'משפחתיות',                en: 'Family-oriented' },
  { value: 'depth',            he: 'עומק ושיחות',             en: 'Depth & Conversations' },
  { value: 'lightness',        he: 'קלילות',                  en: 'Lightness' },
  { value: 'spiritual',        he: 'שאיפות רוחניות',          en: 'Spiritual Aspirations' },
  { value: 'worldview',        he: 'השקפת חיים דומה',         en: 'Similar Worldview' },
]

// ─── Brings to Marriage ───────────────────────────────────────────────────────

export const BRINGS_MALE: Option[] = [
  { value: 'stability',    he: 'יציבות',            en: 'Stability' },
  { value: 'emotional',    he: 'פתיחות רגשית',      en: 'Emotional Openness' },
  { value: 'commitment',   he: 'מחויבות',           en: 'Commitment' },
  { value: 'responsibility',he: 'אחריות',           en: 'Responsibility' },
  { value: 'homey',        he: 'ביתיות',            en: 'Homeyness' },
  { value: 'depth',        he: 'עומק',              en: 'Depth' },
  { value: 'lightness',    he: 'קלילות',            en: 'Lightness' },
  { value: 'reliability',  he: 'אמינות',            en: 'Reliability' },
  { value: 'communication',he: 'תקשורת פתוחה',     en: 'Open Communication' },
]

export const BRINGS_FEMALE: Option[] = [
  { value: 'stability',    he: 'יציבות',            en: 'Stability' },
  { value: 'emotional',    he: 'פתיחות רגשית',      en: 'Emotional Openness' },
  { value: 'depth',        he: 'עומק',              en: 'Depth' },
  { value: 'responsibility',he: 'אחריות',           en: 'Responsibility' },
  { value: 'homey',        he: 'ביתיות',            en: 'Homeyness' },
  { value: 'commitment',   he: 'מחויבות',           en: 'Commitment' },
  { value: 'lightness',    he: 'קלילות',            en: 'Lightness' },
  { value: 'communication',he: 'תקשורת פתוחה',     en: 'Open Communication' },
  { value: 'reliability',  he: 'אמינות',            en: 'Reliability' },
]

// ─── Flexibility ──────────────────────────────────────────────────────────────

export const FLEXIBILITY_OPTIONS: Option[] = [
  { value: 'preferred',     he: 'רצוי',              en: 'Preferred' },
  { value: 'important',     he: 'חשוב',              en: 'Important' },
  { value: 'very_important',he: 'חשוב מאוד',         en: 'Very Important' },
  { value: 'not_important', he: 'לא חשוב בכלל',      en: 'Not Important at All' },
]

// ─── Male Clothing ────────────────────────────────────────────────────────────

export const MALE_CLOTHING_OPTIONS: Option[] = [
  { value: 'only_bw',          he: 'רק שחור לבן',                        en: 'Only Black/White' },
  { value: 'always_colorful',  he: 'צבעוני תמיד',                        en: 'Always Colorful' },
  { value: 'colorful_weekday', he: 'צבעוני ביום חול, שחור לבן שבת',     en: 'Colorful weekday, B/W Shabbat' },
  { value: 'black_kippah',     he: 'כיפה שחורה',                         en: 'Black Kippah' },
  { value: 'other_kippah',     he: 'כיפה אחר',                           en: 'Other Kippah' },
]

// ─── Male desired partner clothing ───────────────────────────────────────────

export const MALE_PARTNER_CLOTHING_OPTIONS: Option[] = [
  { value: 'modern_modest',   he: 'מודרני וצנוע',          en: 'Modern & Modest' },
  { value: 'very_modern',     he: 'מודרני מאוד',           en: 'Very Modern' },
  { value: 'very_simple',     he: 'פשוט מאוד',             en: 'Very Simple' },
  { value: 'simple_updated',  he: 'פשוט ועדכני',           en: 'Simple & Updated' },
  { value: 'wig_any',         he: 'פאה (לא משנה אורך)',    en: 'Wig (any length)' },
  { value: 'wig_only',        he: 'רק פאה',                en: 'Wig Only' },
  { value: 'kerchief',        he: 'מטפחת',                 en: 'Kerchief' },
  { value: 'wig_kerchief',    he: 'פאה ומטפחת',            en: 'Wig + Kerchief' },
  { value: 'wig_ribbon',      he: 'פאה וסרט',              en: 'Wig + Ribbon' },
  { value: 'wig_hat',         he: 'פאה וכובע',             en: 'Wig + Hat' },
  { value: 'no_preference',   he: 'לא משנה',               en: 'No Preference' },
]

// ─── Female Clothing ──────────────────────────────────────────────────────────

export const FEMALE_CLOTHING_OPTIONS: Option[] = [
  { value: 'very_simple',  he: 'פשוט מאוד',          en: 'Very Simple' },
  { value: 'simple',       he: 'פשוט',               en: 'Simple' },
  { value: 'classic',      he: 'קלאסי',              en: 'Classic' },
  { value: 'stylish',      he: 'עדכני בסטייל',       en: 'Stylish & Updated' },
  { value: 'respectable',  he: 'מכובד',              en: 'Respectable' },
  { value: 'modern',       he: 'מודרני',             en: 'Modern' },
  { value: 'very_modern',  he: 'מודרני מאוד',        en: 'Very Modern' },
]

// ─── Headcovering ─────────────────────────────────────────────────────────────

export const HEADCOVERING_OPTIONS: Option[] = [
  { value: 'wig_no_cut',      he: 'פאה טופ לייס / ללא תספורת', en: 'Top-lace (No cut)' },
  { value: 'wig_with_cut',    he: 'פאה טופ לייס / עם תספורת',  en: 'Top-lace (With cut)' },
  { value: 'wig_only',        he: 'רק פאה',                      en: 'Wig only' },
  { value: 'wig_plus_cover',  he: 'פאה עם כיסוי',               en: 'Wig + Cover' },
  { value: 'kerchief_only',   he: 'רק מטפחת',                   en: 'Kerchief only' },
  { value: 'no_preference',   he: 'פאה/מטפחת (ללא עדיפות)',     en: 'Wig/Kerchief (no preference)' },
]

// ─── Female desired partner clothing ─────────────────────────────────────────

export const FEMALE_PARTNER_CLOTHING_OPTIONS: Option[] = [
  { value: 'only_bw',          he: 'רק שחור לבן',                        en: 'Only Black/White' },
  { value: 'bw_elegant',       he: 'שחור לבן אלגנטי / עדכני',           en: 'B/W Elegant / Updated' },
  { value: 'colorful_weekday', he: 'צבעוני ביום חול, שחור לבן בשבת',    en: 'Colorful weekday, B/W Shabbat' },
  { value: 'very_modern',      he: 'צבעוני, מודרני מאוד',               en: 'Colorful, Very Modern' },
]

// ─── Phone Type ───────────────────────────────────────────────────────────────

export const PHONE_TYPE_OPTIONS: Option[] = [
  { value: 'kosher',           he: 'טלפון פשוט (כשר)',            en: 'Simple Phone (Kosher)' },
  { value: 'filtered',         he: 'סמארטפון מוגן/מסונן',         en: 'Filtered Smartphone' },
  { value: 'smartphone',       he: 'סמארטפון לא כשר',             en: 'Non-Kosher Smartphone' },
  { value: 'work_smartphone',  he: 'סמארטפון בעבודה, כשר בבית',  en: 'Work Smartphone, Kosher at Home' },
]

// ─── Marital Status ───────────────────────────────────────────────────────────

export const MARITAL_STATUS_OPTIONS: Option[] = [
  { value: 'single',   he: 'רווק/ה',  en: 'Single' },
  { value: 'divorced', he: 'גרוש/ה',  en: 'Divorced' },
  { value: 'widowed',  he: 'אלמן/ה',  en: 'Widowed' },
]

export const MARITAL_STATUS_MALE: Option[] = [
  { value: 'single',   he: 'רווק',   en: 'Single' },
  { value: 'divorced', he: 'גרוש',   en: 'Divorced' },
  { value: 'widowed',  he: 'אלמן',   en: 'Widowed' },
]

export const MARITAL_STATUS_FEMALE: Option[] = [
  { value: 'single',   he: 'רווקה',  en: 'Single' },
  { value: 'divorced', he: 'גרושה',  en: 'Divorced' },
  { value: 'widowed',  he: 'אלמנה',  en: 'Widowed' },
]
