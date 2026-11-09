import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const TO = process.env.CONTACT_TO || 'b.w008833@gmail.com'
// Resend's shared sender works without a verified domain, but then it can only
// deliver to the email address the Resend account was created with.
const FROM = process.env.CONTACT_FROM || 'בונים עולמות <onboarding@resend.dev>'

const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) hits.clear()
  return recent.length > 5
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (limited(ip)) {
    return NextResponse.json({ message: 'נשלחו הרבה הודעות. נסו שוב בעוד כמה דקות.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success to bots.
  if (clean(body.website, 50)) return NextResponse.json({ ok: true })

  const name = clean(body.name, 100)
  const phone = clean(body.phone, 30)
  const subject = clean(body.subject, 150).replace(/\n/g, ' ')
  const message = clean(body.message, 3000)

  if (!name || !phone || !subject || !message) {
    return NextResponse.json({ message: 'יש למלא את כל השדות.' }, { status: 422 })
  }
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    return NextResponse.json({ message: 'מספר הטלפון אינו תקין.' }, { status: 422 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('contact: RESEND_API_KEY is not configured, message not sent')
    return NextResponse.json({ message: 'שליחת ההודעה אינה זמינה כרגע.' }, { status: 503 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `פנייה מהאתר: ${subject}`,
        text: `שם: ${name}\nטלפון: ${phone}\nנושא: ${subject}\n\n${message}\n`,
      }),
    })
    if (!res.ok) {
      console.error('contact: Resend error', res.status, await res.text().catch(() => ''))
      return NextResponse.json({ message: 'שליחת ההודעה נכשלה. נסו שוב.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('contact: send failed', e)
    return NextResponse.json({ message: 'שליחת ההודעה נכשלה. נסו שוב.' }, { status: 502 })
  }
}
