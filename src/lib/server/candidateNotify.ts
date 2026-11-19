/* eslint-disable */
// Server-only: tells a candidate something by email, and also by SMS when they switched it on.
import { sendMail } from '@/lib/server/notify'
import { sendSms, toSmsNumber } from '@/lib/server/sms'

export type CandidateEvent = 'mutual' | 'fee' | 'newProposals' | 'matchOpened'

interface Content {
  subject: string
  lines: string[]
  path: string
  sms: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://bonim-olamot-zoco.vercel.app'

const CONTENT: Record<CandidateEvent, (vars: Record<string, string>) => Content> = {
  mutual: () => ({
    subject: 'יש עניין הדדי',
    lines: ['שני הצדדים סימנו עניין בהצעה.', 'שדכן/ית ייצור איתך קשר בקרוב.'],
    path: '/he/smart-match',
    sms: 'בונים עולמות: יש עניין הדדי בהצעה. שדכן/ית ייצור איתך קשר בקרוב.',
  }),
  fee: (v) => ({
    subject: 'עדכון בנושא דמי שידוך',
    lines: [
      `${v.who || 'השדכן/ית המטפל/ת'} עדכן/ה את סכום דמי השידוך להצעה שלך: ${v.money}.`,
      'הסכום משולם רק לאחר סגירת האירוסין, ולא בשלבים קודמים.',
      'נא להיכנס לאזור האישי כדי לראות ולאשר שקראת.',
    ],
    path: '/he/personal#received',
    sms: `בונים עולמות: עודכן סכום דמי השידוך (${v.money}). הסכום משולם רק לאחר האירוסין. פרטים באזור האישי: ${SITE}/he/personal#received`,
  }),
  matchOpened: (v) => ({
    subject: 'שדכן/ית פתח/ה עבורך הצעה',
    lines: [`${v.who || 'שדכן/ית'} פתח/ה עבורך הצעת שידוך.`, 'אפשר להיכנס ולראות אותה באזור "ההצעות שקיבלתי".'],
    path: '/he/personal#received',
    sms: `בונים עולמות: שדכן/ית פתח/ה עבורך הצעה. ${SITE}/he/personal#received`,
  }),
  newProposals: (v) => ({
    subject: 'יש הצעות חדשות בשבילך',
    lines: [`נוספו ${v.count} הצעות חדשות בעוזר החכם.`, 'אפשר להיכנס ולראות אותן.'],
    path: '/he/smart-match',
    sms: `בונים עולמות: נוספו ${v.count} הצעות חדשות בשבילך. ${SITE}/he/smart-match`,
  }),
}

/**
 * The email is always sent. The SMS goes only to someone who switched on "receive SMS" (at
 * registration or in the personal area), to the phone number they gave.
 */
export async function notifyCandidate(
  admin: any,
  profileId: string,
  event: CandidateEvent,
  vars: Record<string, string> = {},
): Promise<{ email: boolean; sms: boolean }> {
  let answers: Record<string, string> | null = null
  for (const table of ['male_registrations', 'female_registrations']) {
    const { data } = await admin.from(table).select('answers').eq('profile_id', profileId).maybeSingle()
    if (data) { answers = data.answers ?? {}; break }
  }
  if (!answers) return { email: false, sms: false }

  const c = CONTENT[event](vars)
  const email = answers.email ? await sendMail(answers.email, c.subject, c.lines, c.path) : false

  let sms = false
  if (answers.notifySms === '1') {
    const number = toSmsNumber(answers.phone)
    if (number) sms = await sendSms(number, c.sms)
  }
  return { email, sms }
}
