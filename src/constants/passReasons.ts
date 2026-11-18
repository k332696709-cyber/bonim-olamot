// Why a candidate says "not now" to a proposal. The reason is required, and the smart assistant
// uses it to adjust the next proposals.
export const PASS_REASONS = [
  { code: 'age_young', he: 'צעיר/ה מדי', en: 'Too young' },
  { code: 'age_old', he: 'מבוגר/ת מדי', en: 'Too old' },
  { code: 'far', he: 'גר/ה רחוק מדי', en: 'Lives too far' },
  { code: 'style_open', he: 'יותר פתוח/ה ממה שאני מחפש/ת', en: 'More open than I am looking for' },
  { code: 'style_conservative', he: 'יותר שמור/ה ממה שאני מחפש/ת', en: 'More conservative than I am looking for' },
  { code: 'work_study', he: 'עיסוק או לימודים לא מתאימים', en: 'Occupation or studies do not fit' },
  { code: 'community', he: 'קהילה או עדה לא מתאימה', en: 'Community does not fit' },
  { code: 'marital', he: 'מצב משפחתי לא מתאים', en: 'Family status does not fit' },
  { code: 'other', he: 'אחר (חובה לפרט)', en: 'Other (please explain)' },
] as const

export type PassReason = (typeof PASS_REASONS)[number]['code']
export const PASS_REASON_CODES: string[] = PASS_REASONS.map((r) => r.code)
