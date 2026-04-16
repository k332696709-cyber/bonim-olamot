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
} from '@/constants/formOptions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLabel(options: { value: string; he: string }[], value: string): string {
  return options.find((o) => o.value === value)?.he ?? value
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const NAVY     = '#003366'
const BURGUNDY = '#800020'
const GRAY     = '#6B7280'
const LIGHT    = '#F3F4F6'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    direction: 'rtl',
  },
  header: {
    backgroundColor: NAVY,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  headerSub: {
    color: '#99b5d7',
    fontSize: 10,
  },
  confidential: {
    color: BURGUNDY,
    fontSize: 9,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: NAVY,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
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
    color: GRAY,
    fontSize: 10,
    width: 140,
  },
  rowValue: {
    color: '#111827',
    fontSize: 10,
    flex: 1,
    fontFamily: 'Helvetica-Bold',
  },
  hiddenValue: {
    color: '#9CA3AF',
    fontSize: 10,
    fontStyle: 'italic',
  },
  traitTag: {
    backgroundColor: '#EFF6FF',
    color: NAVY,
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
    color: GRAY,
    fontSize: 8,
  },
})

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function buildProfilePdf(profile: FemaleProfile) {
  // Redact sensitive fields
  const { lastName: _lastName, phone: _phone, ...safeProfile } = profile

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, 'כרטיס בירורים – בונים עולמות'),
        React.createElement(Text, { style: styles.headerSub }, `${safeProfile.firstName} | גיל: ${safeProfile.age} | ${safeProfile.city}`),
        React.createElement(Text, { style: styles.confidential }, 'סודי – לשימוש פנימי בלבד'),
      ),

      // Personal Info
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'פרטים אישיים'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'שם פרטי:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.firstName),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'שם משפחה:'),
          React.createElement(Text, { style: styles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'גיל:'),
          React.createElement(Text, { style: styles.rowValue }, String(safeProfile.age)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'תאריך לידה עברי:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.hebrewBirthday),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'קהילה:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.community),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'עיסוק:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.occupation),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'עיר:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.city),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'טלפון:'),
          React.createElement(Text, { style: styles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'דוא"ל:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.email),
        ),
      ),

      // Profile Details
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'פרטי פרופיל'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סגנון:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(FEMALE_STYLE_OPTIONS, safeProfile.style)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'תכונות אופי:'),
          React.createElement(Text, { style: styles.rowValue },
            safeProfile.traits.map((t) => getLabel(TRAIT_OPTIONS_FEMALE, t)).join(' · '),
          ),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סגנון לבוש:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(FEMALE_CLOTHING_OPTIONS, safeProfile.clothing)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'כיסוי ראש:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(HEADCOVERING_OPTIONS, safeProfile.headcovering)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'לבוש בן זוג רצוי:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(FEMALE_PARTNER_CLOTHING_OPTIONS, safeProfile.partnerClothing)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סוג טלפון:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(PHONE_TYPE_OPTIONS, safeProfile.phoneType)),
        ),
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'בונים עולמות – שידוכים בדרך האמת'),
        React.createElement(Text, { style: styles.footerText }, new Date().toLocaleDateString('he-IL')),
      ),
    )
  )
}

// ─── Male PDF ─────────────────────────────────────────────────────────────────

export function buildMaleProfilePdf(profile: MaleProfile) {
  const { lastName: _lastName, phone: _phone, ...safeProfile } = profile

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, 'כרטיס בירורים – בונים עולמות'),
        React.createElement(Text, { style: styles.headerSub }, `${safeProfile.firstName} | גיל: ${safeProfile.age} | ${safeProfile.city}`),
        React.createElement(Text, { style: styles.confidential }, 'סודי – לשימוש פנימי בלבד'),
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'פרטים אישיים'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'שם פרטי:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.firstName),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'שם משפחה:'),
          React.createElement(Text, { style: styles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'גיל:'),
          React.createElement(Text, { style: styles.rowValue }, String(safeProfile.age)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'תאריך לידה עברי:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.hebrewBirthday),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'קהילה:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.community),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'עיסוק:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.occupation),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'עיר:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.city),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'טלפון:'),
          React.createElement(Text, { style: styles.hiddenValue }, '***'),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'דוא"ל:'),
          React.createElement(Text, { style: styles.rowValue }, safeProfile.email),
        ),
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'פרטי פרופיל'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סגנון:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(MALE_STYLE_OPTIONS, safeProfile.style)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'תכונות אופי:'),
          React.createElement(Text, { style: styles.rowValue },
            safeProfile.traits.map((t) => getLabel(TRAIT_OPTIONS_MALE, t)).join(' · '),
          ),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סגנון לבוש:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(MALE_CLOTHING_OPTIONS, safeProfile.clothing)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'לבוש בת זוג רצויה:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(MALE_PARTNER_CLOTHING_OPTIONS, safeProfile.partnerClothing)),
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.rowLabel }, 'סוג טלפון:'),
          React.createElement(Text, { style: styles.rowValue }, getLabel(PHONE_TYPE_OPTIONS, safeProfile.phoneType)),
        ),
      ),

      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, 'בונים עולמות – שידוכים בדרך האמת'),
        React.createElement(Text, { style: styles.footerText }, new Date().toLocaleDateString('he-IL')),
      ),
    )
  )
}
