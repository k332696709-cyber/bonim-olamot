import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyOwner } from '@/lib/server/notify'

export const runtime = 'nodejs'

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

/** Stores a contact-form message in the administrator's inbox (contact_messages table). */
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ message: 'שליחת ההודעה אינה זמינה כרגע.' }, { status: 503 })
  }

  try {
    const supabase = createClient()
    // contact_messages is not in the generated Database types.
    const { error } = await (supabase as any)
      .from('contact_messages')
      .insert({ name, phone, subject, message })
    if (error) {
      console.error('contact: insert failed', error.message)
      return NextResponse.json({ message: 'שליחת ההודעה נכשלה. נסו שוב.' }, { status: 502 })
    }
    await notifyOwner('פנייה חדשה מהאתר', [`שם: ${name}`, `נושא: ${subject}`], '/he/matchmaker/inbox')
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('contact: error', e)
    return NextResponse.json({ message: 'שליחת ההודעה נכשלה. נסו שוב.' }, { status: 502 })
  }
}
