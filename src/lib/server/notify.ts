import nodemailer from 'nodemailer'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bonim-olamot-zoco.vercel.app').replace(/\/$/, '')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim().slice(0, 150)

/**
 * Sends a short email through the Gmail account configured in the environment with an app
 * password (GMAIL_USER, GMAIL_APP_PASSWORD). Returns true when it was sent. If it is not
 * configured, or sending fails, it returns false and nothing else happens: an email must
 * never break the visitor's request.
 */
export async function sendMail(to: string, subject: string, lines: string[], path?: string): Promise<boolean> {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass || !to) return false

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 6000,
      socketTimeout: 6000,
    })
    const link = path ? `${SITE}${path}` : ''
    const text = [...lines, link && `לפרטים: ${link}`].filter(Boolean).join('\n')
    const html =
      `<div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; line-height: 1.7">` +
      `<h2 style="margin: 0 0 8px">${esc(oneLine(subject))}</h2>` +
      lines.map((l) => `<p style="margin: 2px 0">${esc(l)}</p>`).join('') +
      (link ? `<p style="margin-top: 14px"><a href="${esc(link)}">לפתיחה באתר</a></p>` : '') +
      `</div>`
    await Promise.race([
      transport.sendMail({ from: `"בונים עולמות" <${user}>`, to, subject: oneLine(subject), text, html }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('mail timeout')), 8000)),
    ])
    return true
  } catch (e) {
    console.error('sendMail failed:', e instanceof Error ? e.message : e)
    return false
  }
}

/**
 * Emails the site owner about something that needs attention (new registration, inquiry,
 * matchmaker request, mutual interest). Goes to NOTIFY_EMAIL, or to the sending account itself.
 *
 * Keep the content short and free of phone numbers, photos and sensitive answers; the link
 * leads to the admin area where the details are.
 */
export async function notifyOwner(subject: string, lines: string[], path?: string): Promise<void> {
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER
  if (!to) return
  await sendMail(to, subject, lines, path)
}
