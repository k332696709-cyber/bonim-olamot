import { prettyChoices } from '@/constants/registrationForms'
import { birthDateDisplay } from '@/lib/registration/birthDate'
import { buildProfile } from '@/lib/auth/registration'

/**
 * Converts a website registration (Tally-copy answers) into a row for the `profiles`
 * table, the one the matchmakers' dashboard reads.
 *
 * Structured fields (style, phone type, clothing, traits...) are mapped to the keys the
 * rest of the app understands. Everything else the candidate wrote is kept, as readable
 * Hebrew lines, inside about_me / about_partner / doesnt_suit so nothing is lost.
 */
export function registrationToProfileRow(
  gender: 'male' | 'female',
  a: Record<string, string>,
  photoPaths: string[],
) {
  const p = buildProfile(gender, a, 'import') as any
  const pretty = prettyChoices

  // "שם מלא" usually already contains the surname; avoid showing it twice.
  const last = (a.lastName ?? '').trim()
  let first = (a.fullName ?? '').trim()
  if (last && first.endsWith(last) && first.length > last.length) first = first.slice(0, -last.length).trim()

  const childrenNum = Number((a.childrenCount ?? '').replace(/\D/g, '')) || 0
  const hasChildren = childrenNum > 0 || /עם ילדים/.test(a.maritalStatus ?? '')

  const line = (label: string, value?: string) => (value && value.trim() ? `${label}: ${value.trim()}` : '')
  const join = (lines: string[]) => lines.filter(Boolean).join('\n')

  const aboutMe = join([
    a.aboutMe?.trim() ?? '',
    '',
    line('כינוי', a.nickname),
    line('מי מילא את הכרטיס', [pretty(a.filledBy), (a.fillerContact ?? '').trim()].filter(Boolean).join(' - ')),
    line('וואטסאפ', (a.whatsapp ?? '').includes('מספר אחר') ? `על מספר אחר: ${(a.whatsappNumber ?? '').trim()}` : (a.whatsapp ?? '').includes('בכלל') ? 'אין וואטסאפ' : (a.whatsapp ?? '').startsWith('כן') ? 'יש על מספר הטלפון' : ''),
    line('מסרונים', a.notifySms === '1' ? 'מאשר/ת קבלת עדכונים במסרון' : ''),
    line('שיחות טלפון', a.notifyCalls === '1' ? 'מאשר/ת שיחות טלפון בנושא התיק' : ''),
    line('עדה', pretty(a.edah)),
    line('מגורים', pretty(a.housing)),
    line('לימודי מקצוע', a.professionalStudies),
    line('לימודי מקצוע בעבר', a.profPast),
    line('לימודי מקצוע כעת', a.profNow),
    line('לימודי מקצוע בעתיד', a.profFuture),
    line('לימודים', a.studies),
    line('ישיבה קטנה', a.yeshivaKtana),
    line('ישיבה גדולה', a.yeshivaGdola),
    line('ישיבה גבוהה', a.yeshivaGvoha),
    line('תיכון', a.highSchool),
    line('סמינר', a.seminary),
    line('מדרשה', a.midrasha),
    line('קביעת עיתים/מסגרת', a.framework),
    line('איך מגדיר/ה את הסגנון', pretty(a.styleSelf)),
    line('פירוט הסגנון', a.styleSelfDetail),
    line('סגנון לבוש', pretty(a.clothingSelf)),
    line('כובע/כיסוי ראש אחרי חתונה', pretty(a.hatAfterWedding) || pretty(a.headcoverSelf)),
    line('גישה לטכנולוגיה', pretty(a.techSelf)),
    line('רמת חיים/סגנון', pretty(a.livingSelf)),
    line('מאפיינים', pretty(a.traits)),
    line('מה מביא/ה לנישואים', pretty(a.brings)),
    line('מצב רפואי/נפשי', a.medical),
    line('פירוט רפואי/נפשי', a.medicalDetail),
    line('מצב ההורים', a.parents),
    line('סגנון הבית', a.houseStyle),
    line('מספרים לבירורים', Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
      const name = (a[`ref${n}Name`] ?? '').trim(), rel = (a[`ref${n}Relation`] ?? '').trim(), ph = (a[`ref${n}Phone`] ?? '').trim()
      return name || ph ? `${name}${rel ? ` (${rel})` : ''} ${ph}`.trim() : ''
    }).filter(Boolean).join(' | ')),
  ])

  const aboutPartner = join([
    a.aboutPartner?.trim() ?? '',
    '',
    line('סגנון מבוקש', pretty(a.styleSought)),
    line('פירוט הסגנון המבוקש', a.styleSoughtDetail),
    line('סגנון לבוש שלו/ה', pretty(a.clothingHer) || pretty(a.clothingHim)),
    line('כיסוי ראש/כובע', pretty(a.headcoverHer) || pretty(a.hatHim)),
    line('גישה לטכנולוגיה', pretty(a.techHer) || pretty(a.techHim)),
    line('רמת חיים/סגנון', pretty(a.livingHer) || pretty(a.livingHim)),
    line('עדה/זרם מועדפים', a.edahSought),
    line('טווח גילאים', a.ageRange),
    line('ארץ מועדפת', a.country),
  ])

  return {
    gender,
    first_name: first || a.fullName || '—',
    last_name: last || '—',
    age: p.age,
    hebrew_birthday: birthDateDisplay(a.birthDate) || null,
    marital_status: a.maritalStatus || null,
    has_children: hasChildren,
    number_of_children: childrenNum || null,
    city: a.city || null,
    community: [pretty(a.community), (a.hasidut ?? '').trim()].filter(Boolean).join(' - ') || null,
    phone: a.phone || null,
    email: a.email || null,
    occupation: a.occupation || null,
    style: p.style || null,
    partner_style: p.partnerStyle || null,
    preferred_stream: null,
    clothing: p.clothing || null,
    headcovering: gender === 'female' ? p.headcovering || null : null,
    partner_clothing: p.partnerClothing || null,
    phone_type: p.phoneType || null,
    traits: p.traits ?? [],
    relationship_values: p.relationshipValues ?? [],
    brings: p.brings ?? [],
    doesnt_suit: a.notSuitable || null,
    flexibility: 'important',
    about_me: aboutMe,
    about_partner: aboutPartner,
    photos: photoPaths,
  }
}
