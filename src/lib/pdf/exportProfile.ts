import path from 'path'
import { pathToFileURL } from 'url'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import React from 'react'
import type { FemaleProfile, MaleProfile } from '@/types/registration'
import {
  FEMALE_STYLE_OPTIONS,
  MALE_STYLE_OPTIONS,
  TRAIT_OPTIONS_FEMALE,
  TRAIT_OPTIONS_MALE,
  FEMALE_CLOTHING_OPTIONS,
  MALE_CLOTHING_OPTIONS,
  HEADCOVERING_OPTIONS,
  FEMALE_PARTNER_CLOTHING_OPTIONS,
  MALE_PARTNER_CLOTHING_OPTIONS,
  PHONE_TYPE_OPTIONS,
  RELATIONSHIP_VALUES_FEMALE,
  RELATIONSHIP_VALUES_MALE,
  BRINGS_FEMALE,
  BRINGS_MALE,
  FLEXIBILITY_OPTIONS,
  MARITAL_STATUS_FEMALE,
  MARITAL_STATUS_MALE,
  FEMALE_PARTNER_STYLE_OPTIONS,
  MALE_PARTNER_STYLE_OPTIONS,
} from '@/constants/formOptions'

// ─── Font Registration ─────────────────────────────────────────────────────────
// pathToFileURL converts Windows backslash paths → proper file:// URIs that
// @react-pdf/renderer's fontkit can load cross-platform.

function fontUrl(filename: string): string {
  return pathToFileURL(path.join(process.cwd(), 'public', 'fonts', filename)).href
}

Font.register({
  family: 'Heebo',
  fonts: [
    { src: fontUrl('Heebo-Regular.ttf'), fontWeight: 400 },
    { src: fontUrl('Heebo-Bold.ttf'),    fontWeight: 700 },
  ],
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LangKey = 'he' | 'en'

function getLabel(
  options: { value: string; he: string; en: string }[],
  value: string,
  lang: LangKey = 'he',
): string {
  const opt = options.find((o) => o.value === value)
  if (!opt) return value
  return lang === 'he' ? opt.he : opt.en
}

function getLabels(
  options: { value: string; he: string; en: string }[],
  values: string[],
  lang: LangKey = 'he',
): string {
  return values.map((v) => getLabel(options, v, lang)).join('  ·  ')
}

// ─── Locale Strings ───────────────────────────────────────────────────────────

const UI: Record<LangKey, Record<string, string>> = {
  he: {
    fullResume:         'קורות חיים מלאים',
    brand:              'בונים עולמות',
    tagline:            'שידוכים בדרך האמת',
    confidential:       'סודי – לשימוש פנימי בלבד',
    personalDetails:    'פרטים אישיים',
    firstName:          'שם פרטי',
    age:                'גיל',
    hebrewBirthday:     'תאריך לידה עברי',
    status:             'מצב משפחתי',
    hasChildren:        'ילדים',
    numChildren:        'מספר ילדים',
    community:          'קהילה',
    city:               'עיר',
    occupation:         'עיסוק',
    education:          'רקע לימודי',
    preferredStream:    'ישיבה / מדרשה',
    lifestyle:          'אורח חיים וסגנון',
    style:              'סגנון',
    flexibility:        'גמישות',
    relationshipValues: 'ערכים בקשר',
    appearance:         'מראה וסגנון לבוש',
    clothing:           'סגנון לבוש',
    headcovering:       'כיסוי ראש',
    phoneType:          'סוג טלפון',
    characterTraits:    'תכונות אופי',
    traits:             'תכונות',
    brings:             'מה אני מביא/ה לקשר',
    aboutMe:            'קצת עלי',
    lookingFor:         'מה אני מחפש/ת',
    partnerStyle:       'סגנון בן/בת הזוג',
    partnerClothing:    'לבוש בן/בת הזוג',
    aboutPartner:       'על בן/בת הזוג המיוחל/ת',
    doesntSuit:         'מה לא מתאים לי',
    yes:                'כן',
    no:                 'לא',
    hidden:             '***',
    page:               'עמוד',
  },
  en: {
    fullResume:         'Full Resume',
    brand:              'Bonim Olamot',
    tagline:            'Matchmaking with Truth',
    confidential:       'Confidential – Internal Use Only',
    personalDetails:    'Personal Details',
    firstName:          'First Name',
    age:                'Age',
    hebrewBirthday:     'Hebrew Birthday',
    status:             'Marital Status',
    hasChildren:        'Children',
    numChildren:        'Number of Children',
    community:          'Community',
    city:               'City',
    occupation:         'Occupation',
    education:          'Educational Background',
    preferredStream:    'Yeshiva / Seminary',
    lifestyle:          'Lifestyle & Daily Routine',
    style:              'Style',
    flexibility:        'Flexibility',
    relationshipValues: 'Relationship Values',
    appearance:         'Appearance & Clothing Style',
    clothing:           'Clothing Style',
    headcovering:       'Head Covering',
    phoneType:          'Phone Type',
    characterTraits:    'Character Traits',
    traits:             'Traits',
    brings:             'What I Bring to a Relationship',
    aboutMe:            'About Me',
    lookingFor:         'What I Am Looking For',
    partnerStyle:       'Partner Style',
    partnerClothing:    'Partner Clothing',
    aboutPartner:       'About My Ideal Partner',
    doesntSuit:         "What Doesn't Suit Me",
    yes:                'Yes',
    no:                 'No',
    hidden:             '***',
    page:               'Page',
  },
}

// ─── Design Tokens ─────────────────────────────────────────────────────────────

const NAVY     = '#003366'
const BURGUNDY = '#800020'
const GOLD     = '#C9A84C'
const GRAY     = '#6B7280'
const LIGHT_BG = '#F8F9FB'
const BORDER   = '#E5E7EB'
const TEXT     = '#111827'

// ─── Style Factories ──────────────────────────────────────────────────────────

function makeStyles(lang: LangKey) {
  const isRTL = lang === 'he'
  const textAlign = isRTL ? 'right' : 'left'
  const rowDir   = isRTL ? 'row-reverse' : 'row'

  return StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: '#ffffff',
      fontFamily: 'Heebo',
      direction: isRTL ? 'rtl' : 'ltr',
    },
    // ── Header ──────────────────────────────────────────────────────────────
    headerBand: {
      backgroundColor: NAVY,
      paddingHorizontal: 40,
      paddingTop: 28,
      paddingBottom: 20,
    },
    headerGoldBar: {
      height: 3,
      backgroundColor: GOLD,
      marginBottom: 14,
    },
    headerBrand: {
      color: GOLD,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1.5,
      textAlign,
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 700,
      textAlign,
      marginTop: 4,
    },
    headerSub: {
      color: '#99b5d7',
      fontSize: 10,
      textAlign,
      marginTop: 5,
    },
    headerConfidential: {
      color: BURGUNDY,
      fontSize: 8,
      textAlign,
      marginTop: 6,
      fontWeight: 700,
    },
    // ── Body ────────────────────────────────────────────────────────────────
    body: {
      paddingHorizontal: 40,
      paddingTop: 24,
      paddingBottom: 60, // leave space for footer
    },
    // ── Section ─────────────────────────────────────────────────────────────
    section: {
      marginBottom: 18,
    },
    sectionHeader: {
      flexDirection: rowDir,
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionAccent: {
      width: 4,
      height: 16,
      backgroundColor: GOLD,
      marginRight: isRTL ? 0 : 8,
      marginLeft: isRTL ? 8 : 0,
      borderRadius: 2,
    },
    sectionTitle: {
      color: NAVY,
      fontSize: 12,
      fontWeight: 700,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: BORDER,
      marginBottom: 8,
    },
    // ── Grid Rows ────────────────────────────────────────────────────────────
    grid: {
      backgroundColor: LIGHT_BG,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    row: {
      flexDirection: rowDir,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: BORDER,
      alignItems: 'flex-start',
    },
    rowLast: {
      flexDirection: rowDir,
      paddingVertical: 5,
      alignItems: 'flex-start',
    },
    rowLabel: {
      color: GRAY,
      fontSize: 9,
      fontWeight: 700,
      width: 120,
      textAlign,
      paddingTop: 1,
    },
    rowValue: {
      color: TEXT,
      fontSize: 10,
      fontWeight: 400,
      flex: 1,
      textAlign,
    },
    rowValueBold: {
      color: TEXT,
      fontSize: 10,
      fontWeight: 700,
      flex: 1,
      textAlign,
    },
    hiddenValue: {
      color: '#9CA3AF',
      fontSize: 10,
      fontStyle: 'italic',
      flex: 1,
    },
    // ── Tag cloud ────────────────────────────────────────────────────────────
    tagsWrap: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: 4,
    },
    tag: {
      backgroundColor: '#EFF6FF',
      color: NAVY,
      fontSize: 9,
      fontWeight: 700,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#BFDBFE',
    },
    // ── Text boxes ───────────────────────────────────────────────────────────
    textBox: {
      backgroundColor: '#FFFBEB',
      borderLeftWidth: isRTL ? 0 : 3,
      borderRightWidth: isRTL ? 3 : 0,
      borderLeftColor: isRTL ? 'transparent' : GOLD,
      borderRightColor: isRTL ? GOLD : 'transparent',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 4,
      marginTop: 4,
    },
    textBoxContent: {
      color: TEXT,
      fontSize: 10,
      lineHeight: 1.6,
      textAlign,
    },
    textBoxLabel: {
      color: GRAY,
      fontSize: 8,
      fontWeight: 700,
      marginBottom: 4,
      textAlign,
    },
    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: NAVY,
      paddingHorizontal: 40,
      paddingVertical: 8,
      flexDirection: rowDir,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerBrand: {
      color: GOLD,
      fontSize: 8,
      fontWeight: 700,
    },
    footerTagline: {
      color: '#99b5d7',
      fontSize: 7,
    },
    footerDate: {
      color: '#99b5d7',
      fontSize: 7,
    },
  })
}

// ─── Shared Sub-components ─────────────────────────────────────────────────────

function SectionHeader(
  { title, styles }: { title: string; styles: ReturnType<typeof makeStyles> }
) {
  return React.createElement(
    View,
    { style: styles.sectionHeader },
    React.createElement(View, { style: styles.sectionAccent }),
    React.createElement(Text, { style: styles.sectionTitle }, title),
  )
}

function GridRow(
  { label, value, last = false, styles }:
  { label: string; value: string; last?: boolean; styles: ReturnType<typeof makeStyles> }
) {
  return React.createElement(
    View,
    { style: last ? styles.rowLast : styles.row },
    React.createElement(Text, { style: styles.rowLabel }, label),
    React.createElement(Text, { style: styles.rowValue }, value),
  )
}

function TextBox(
  { label, text, styles }:
  { label: string; text: string; styles: ReturnType<typeof makeStyles> }
) {
  if (!text) return null
  return React.createElement(
    View,
    { style: styles.textBox },
    React.createElement(Text, { style: styles.textBoxLabel }, label),
    React.createElement(Text, { style: styles.textBoxContent }, text),
  )
}

function TagCloud(
  { tags, styles }:
  { tags: string[]; styles: ReturnType<typeof makeStyles> }
) {
  return React.createElement(
    View,
    { style: styles.tagsWrap },
    ...tags.map((tag, i) =>
      React.createElement(Text, { key: i, style: styles.tag }, tag)
    ),
  )
}

function PageFooter(
  { lang, styles }: { lang: LangKey; styles: ReturnType<typeof makeStyles> }
) {
  const L = UI[lang]
  const dateStr = new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB')
  return React.createElement(
    View,
    { style: styles.footer, fixed: true },
    React.createElement(Text, { style: styles.footerBrand }, L.brand),
    React.createElement(Text, { style: styles.footerTagline }, L.tagline),
    React.createElement(Text, { style: styles.footerDate }, dateStr),
  )
}

// ─── Female Full Resume ────────────────────────────────────────────────────────

export function buildFullResumePdf(profile: FemaleProfile, lang: LangKey = 'he') {
  const styles = makeStyles(lang)
  const L = UI[lang]
  const { lastName: _ln, phone: _ph, email: _em, ...safe } = profile

  const traitLabels  = safe.traits.map((t) => getLabel(TRAIT_OPTIONS_FEMALE, t, lang))
  const bringsLabels = safe.brings.map((b) => getLabel(BRINGS_FEMALE, b, lang))
  const rvLabels     = getLabels(RELATIONSHIP_VALUES_FEMALE, safe.relationshipValues, lang)

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // ── Header ──────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.headerBand, fixed: true },
        React.createElement(View, { style: styles.headerGoldBar }),
        React.createElement(Text, { style: styles.headerBrand }, L.brand.toUpperCase()),
        React.createElement(Text, { style: styles.headerTitle }, L.fullResume),
        React.createElement(
          Text,
          { style: styles.headerSub },
          `${safe.firstName}  ·  ${L.age}: ${safe.age}  ·  ${safe.city}`,
        ),
        React.createElement(Text, { style: styles.headerConfidential }, L.confidential),
      ),

      // ── Body ────────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.body },

        // ── 1. Personal Details ─────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.personalDetails, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.firstName,  value: safe.firstName, styles }),
            React.createElement(GridRow, { label: L.age,        value: String(safe.age), styles }),
            React.createElement(GridRow, { label: L.hebrewBirthday, value: safe.hebrewBirthday, styles }),
            React.createElement(GridRow, { label: L.status,     value: getLabel(MARITAL_STATUS_FEMALE, safe.status, lang), styles }),
            ...(safe.hasChildren
              ? [
                  React.createElement(GridRow, { label: L.hasChildren, value: L.yes, styles }),
                  React.createElement(GridRow, { label: L.numChildren, value: String(safe.numberOfChildren ?? ''), styles }),
                ]
              : []),
            React.createElement(GridRow, { label: L.community,  value: safe.community, styles }),
            React.createElement(GridRow, { label: L.city,       value: safe.city,      styles }),
            React.createElement(GridRow, { label: L.occupation, value: safe.occupation, last: true, styles }),
          ),
        ),

        // ── 2. Educational Background ───────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.education, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.preferredStream, value: safe.preferredStream || '—', last: true, styles }),
          ),
        ),

        // ── 3. Lifestyle ────────────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.lifestyle, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.style,              value: getLabel(FEMALE_STYLE_OPTIONS, safe.style, lang), styles }),
            React.createElement(GridRow, { label: L.flexibility,        value: getLabel(FLEXIBILITY_OPTIONS,  safe.flexibility, lang), styles }),
            React.createElement(GridRow, { label: L.relationshipValues, value: rvLabels, last: true, styles }),
          ),
        ),

        // ── 4. Appearance & Clothing ────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.appearance, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.clothing,    value: getLabel(FEMALE_CLOTHING_OPTIONS, safe.clothing,    lang), styles }),
            React.createElement(GridRow, { label: L.headcovering, value: getLabel(HEADCOVERING_OPTIONS,   safe.headcovering, lang), styles }),
            React.createElement(GridRow, { label: L.phoneType,   value: getLabel(PHONE_TYPE_OPTIONS,      safe.phoneType,   lang), last: true, styles }),
          ),
        ),

        // ── 5. Character Traits ─────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.characterTraits, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(
              View,
              { style: styles.row },
              React.createElement(Text, { style: styles.rowLabel }, L.traits),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(TagCloud, { tags: traitLabels, styles }),
              ),
            ),
            React.createElement(
              View,
              { style: styles.rowLast },
              React.createElement(Text, { style: styles.rowLabel }, L.brings),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(TagCloud, { tags: bringsLabels, styles }),
              ),
            ),
          ),
        ),

        // ── 6. About Me ─────────────────────────────────────────────────
        safe.aboutMe ? React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.aboutMe, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(TextBox, { label: '', text: safe.aboutMe, styles }),
        ) : null,

        // ── 7. Looking For ──────────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.lookingFor, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.partnerStyle,    value: getLabel(FEMALE_PARTNER_STYLE_OPTIONS,    safe.partnerStyle,    lang), styles }),
            React.createElement(GridRow, { label: L.partnerClothing, value: getLabel(FEMALE_PARTNER_CLOTHING_OPTIONS, safe.partnerClothing, lang), last: !safe.doesntSuit && !safe.aboutPartner, styles }),
          ),
          safe.aboutPartner
            ? React.createElement(TextBox, { label: L.aboutPartner, text: safe.aboutPartner, styles })
            : null,
          safe.doesntSuit
            ? React.createElement(TextBox, { label: L.doesntSuit, text: safe.doesntSuit, styles })
            : null,
        ),
      ),

      // ── Footer ──────────────────────────────────────────────────────────
      React.createElement(PageFooter, { lang, styles }),
    )
  )
}

// ─── Male Full Resume ──────────────────────────────────────────────────────────

export function buildMaleFullResumePdf(profile: MaleProfile, lang: LangKey = 'he') {
  const styles = makeStyles(lang)
  const L = UI[lang]
  const { lastName: _ln, phone: _ph, email: _em, ...safe } = profile

  const traitLabels  = safe.traits.map((t) => getLabel(TRAIT_OPTIONS_MALE, t, lang))
  const bringsLabels = safe.brings.map((b) => getLabel(BRINGS_MALE, b, lang))
  const rvLabels     = getLabels(RELATIONSHIP_VALUES_MALE, safe.relationshipValues, lang)

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // ── Header ──────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.headerBand, fixed: true },
        React.createElement(View, { style: styles.headerGoldBar }),
        React.createElement(Text, { style: styles.headerBrand }, L.brand.toUpperCase()),
        React.createElement(Text, { style: styles.headerTitle }, L.fullResume),
        React.createElement(
          Text,
          { style: styles.headerSub },
          `${safe.firstName}  ·  ${L.age}: ${safe.age}  ·  ${safe.city}`,
        ),
        React.createElement(Text, { style: styles.headerConfidential }, L.confidential),
      ),

      // ── Body ────────────────────────────────────────────────────────────
      React.createElement(
        View,
        { style: styles.body },

        // ── 1. Personal Details ─────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.personalDetails, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.firstName,  value: safe.firstName, styles }),
            React.createElement(GridRow, { label: L.age,        value: String(safe.age), styles }),
            React.createElement(GridRow, { label: L.hebrewBirthday, value: safe.hebrewBirthday, styles }),
            React.createElement(GridRow, { label: L.status,     value: getLabel(MARITAL_STATUS_MALE, safe.status, lang), styles }),
            ...(safe.hasChildren
              ? [
                  React.createElement(GridRow, { label: L.hasChildren, value: L.yes, styles }),
                  React.createElement(GridRow, { label: L.numChildren, value: String(safe.numberOfChildren ?? ''), styles }),
                ]
              : []),
            React.createElement(GridRow, { label: L.community,  value: safe.community, styles }),
            React.createElement(GridRow, { label: L.city,       value: safe.city,      styles }),
            React.createElement(GridRow, { label: L.occupation, value: safe.occupation, last: true, styles }),
          ),
        ),

        // ── 2. Educational Background ───────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.education, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.preferredStream, value: safe.preferredStream || '—', last: true, styles }),
          ),
        ),

        // ── 3. Lifestyle ────────────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.lifestyle, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.style,              value: getLabel(MALE_STYLE_OPTIONS,  safe.style,       lang), styles }),
            React.createElement(GridRow, { label: L.flexibility,        value: getLabel(FLEXIBILITY_OPTIONS, safe.flexibility,  lang), styles }),
            React.createElement(GridRow, { label: L.relationshipValues, value: rvLabels, last: true, styles }),
          ),
        ),

        // ── 4. Appearance & Clothing ────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.appearance, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.clothing,  value: getLabel(MALE_CLOTHING_OPTIONS, safe.clothing,  lang), styles }),
            React.createElement(GridRow, { label: L.phoneType, value: getLabel(PHONE_TYPE_OPTIONS,    safe.phoneType, lang), last: true, styles }),
          ),
        ),

        // ── 5. Character Traits ─────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.characterTraits, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(
              View,
              { style: styles.row },
              React.createElement(Text, { style: styles.rowLabel }, L.traits),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(TagCloud, { tags: traitLabels, styles }),
              ),
            ),
            React.createElement(
              View,
              { style: styles.rowLast },
              React.createElement(Text, { style: styles.rowLabel }, L.brings),
              React.createElement(
                View,
                { style: { flex: 1 } },
                React.createElement(TagCloud, { tags: bringsLabels, styles }),
              ),
            ),
          ),
        ),

        // ── 6. About Me ─────────────────────────────────────────────────
        safe.aboutMe ? React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.aboutMe, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(TextBox, { label: '', text: safe.aboutMe, styles }),
        ) : null,

        // ── 7. Looking For ──────────────────────────────────────────────
        React.createElement(
          View,
          { style: styles.section, wrap: false },
          React.createElement(SectionHeader, { title: L.lookingFor, styles }),
          React.createElement(View, { style: styles.sectionDivider }),
          React.createElement(
            View,
            { style: styles.grid },
            React.createElement(GridRow, { label: L.partnerStyle,    value: getLabel(MALE_PARTNER_STYLE_OPTIONS,    safe.partnerStyle,    lang), styles }),
            React.createElement(GridRow, { label: L.partnerClothing, value: getLabel(MALE_PARTNER_CLOTHING_OPTIONS, safe.partnerClothing, lang), last: !safe.doesntSuit && !safe.aboutPartner, styles }),
          ),
          safe.aboutPartner
            ? React.createElement(TextBox, { label: L.aboutPartner, text: safe.aboutPartner, styles })
            : null,
          safe.doesntSuit
            ? React.createElement(TextBox, { label: L.doesntSuit, text: safe.doesntSuit, styles })
            : null,
        ),
      ),

      // ── Footer ──────────────────────────────────────────────────────────
      React.createElement(PageFooter, { lang, styles }),
    )
  )
}

// ─── Legacy "כרטיס בירורים" PDF (unchanged) ───────────────────────────────────

const LEGACY_NAVY     = '#003366'
const LEGACY_BURGUNDY = '#800020'
const LEGACY_GRAY     = '#6B7280'

const legacyStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Heebo',
    direction: 'rtl',
  },
  header: {
    backgroundColor: LEGACY_NAVY,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerSub: {
    color: '#99b5d7',
    fontSize: 10,
  },
  confidential: {
    color: LEGACY_BURGUNDY,
    fontSize: 9,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: LEGACY_NAVY,
    fontSize: 12,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: {
    color: LEGACY_GRAY,
    fontSize: 10,
    width: 140,
  },
  rowValue: {
    color: '#111827',
    fontSize: 10,
    fontWeight: 700,
    flex: 1,
  },
  hiddenValue: {
    color: '#9CA3AF',
    fontSize: 10,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: LEGACY_GRAY,
    fontSize: 8,
  },
})

export function buildProfilePdf(profile: FemaleProfile) {
  const { lastName: _lastName, phone: _phone, ...safeProfile } = profile

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: legacyStyles.page },
      React.createElement(
        View,
        { style: legacyStyles.header },
        React.createElement(Text, { style: legacyStyles.headerTitle }, 'כרטיס בירורים – בונים עולמות'),
        React.createElement(Text, { style: legacyStyles.headerSub }, `${safeProfile.firstName} | גיל: ${safeProfile.age} | ${safeProfile.city}`),
        React.createElement(Text, { style: legacyStyles.confidential }, 'סודי – לשימוש פנימי בלבד'),
      ),
      React.createElement(
        View,
        { style: legacyStyles.section },
        React.createElement(Text, { style: legacyStyles.sectionTitle }, 'פרטים אישיים'),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'שם פרטי:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.firstName),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'שם משפחה:'),
          React.createElement(Text, { style: legacyStyles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'גיל:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, String(safeProfile.age)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'תאריך לידה עברי:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.hebrewBirthday),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'קהילה:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.community),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'עיסוק:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.occupation),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'עיר:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.city),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'טלפון:'),
          React.createElement(Text, { style: legacyStyles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'דוא"ל:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.email),
        ),
      ),
      React.createElement(
        View,
        { style: legacyStyles.section },
        React.createElement(Text, { style: legacyStyles.sectionTitle }, 'פרטי פרופיל'),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סגנון:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(FEMALE_STYLE_OPTIONS, safeProfile.style)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'תכונות אופי:'),
          React.createElement(Text, { style: legacyStyles.rowValue },
            safeProfile.traits.map((t) => getLabel(TRAIT_OPTIONS_FEMALE, t)).join(' · '),
          ),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סגנון לבוש:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(FEMALE_CLOTHING_OPTIONS, safeProfile.clothing)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'כיסוי ראש:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(HEADCOVERING_OPTIONS, safeProfile.headcovering)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'לבוש בן זוג רצוי:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(FEMALE_PARTNER_CLOTHING_OPTIONS, safeProfile.partnerClothing)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סוג טלפון:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(PHONE_TYPE_OPTIONS, safeProfile.phoneType)),
        ),
      ),
      React.createElement(
        View,
        { style: legacyStyles.footer },
        React.createElement(Text, { style: legacyStyles.footerText }, 'בונים עולמות – שידוכים בדרך האמת'),
        React.createElement(Text, { style: legacyStyles.footerText }, new Date().toLocaleDateString('he-IL')),
      ),
    )
  )
}

export function buildMaleProfilePdf(profile: MaleProfile) {
  const { lastName: _lastName, phone: _phone, ...safeProfile } = profile

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: legacyStyles.page },
      React.createElement(
        View,
        { style: legacyStyles.header },
        React.createElement(Text, { style: legacyStyles.headerTitle }, 'כרטיס בירורים – בונים עולמות'),
        React.createElement(Text, { style: legacyStyles.headerSub }, `${safeProfile.firstName} | גיל: ${safeProfile.age} | ${safeProfile.city}`),
        React.createElement(Text, { style: legacyStyles.confidential }, 'סודי – לשימוש פנימי בלבד'),
      ),
      React.createElement(
        View,
        { style: legacyStyles.section },
        React.createElement(Text, { style: legacyStyles.sectionTitle }, 'פרטים אישיים'),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'שם פרטי:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.firstName),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'שם משפחה:'),
          React.createElement(Text, { style: legacyStyles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'גיל:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, String(safeProfile.age)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'תאריך לידה עברי:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.hebrewBirthday),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'קהילה:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.community),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'עיסוק:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.occupation),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'עיר:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.city),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'טלפון:'),
          React.createElement(Text, { style: legacyStyles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'דוא"ל:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, safeProfile.email),
        ),
      ),
      React.createElement(
        View,
        { style: legacyStyles.section },
        React.createElement(Text, { style: legacyStyles.sectionTitle }, 'פרטי פרופיל'),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סגנון:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(MALE_STYLE_OPTIONS, safeProfile.style)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'תכונות אופי:'),
          React.createElement(Text, { style: legacyStyles.rowValue },
            safeProfile.traits.map((t) => getLabel(TRAIT_OPTIONS_MALE, t)).join(' · '),
          ),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סגנון לבוש:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(MALE_CLOTHING_OPTIONS, safeProfile.clothing)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'לבוש בת זוג רצויה:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(MALE_PARTNER_CLOTHING_OPTIONS, safeProfile.partnerClothing)),
        ),
        React.createElement(View, { style: legacyStyles.row },
          React.createElement(Text, { style: legacyStyles.rowLabel }, 'סוג טלפון:'),
          React.createElement(Text, { style: legacyStyles.rowValue }, getLabel(PHONE_TYPE_OPTIONS, safeProfile.phoneType)),
        ),
      ),
      React.createElement(
        View,
        { style: legacyStyles.footer },
        React.createElement(Text, { style: legacyStyles.footerText }, 'בונים עולמות – שידוכים בדרך האמת'),
        React.createElement(Text, { style: legacyStyles.footerText }, new Date().toLocaleDateString('he-IL')),
      ),
    )
  )
}
