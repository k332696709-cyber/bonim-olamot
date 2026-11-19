import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyOwner } from '@/lib/server/notify'
import { verifyTurnstile, TURNSTILE_FAILED_MESSAGE } from '@/lib/server/turnstile'

export const runtime = 'nodejs'

const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) hits.clear()
  return recent.length > 4
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)

/**
 * Someone asks to publish an engagement announcement. It is saved as "pending": nothing is public
 * until a matchmaker or the administrator approves it, and the owner is told by email.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (limited(ip)) return NextResponse.json({ message: 'נשלחו הרבה בקשות. נסו שוב מאוחר יותר.' }, { status: 429 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  if (clean(body.website, 50)) return NextResponse.json({ ok: true }) // honeypot
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json({ message: TURNSTILE_FAILED_MESSAGE }, { status: 400 })
  }

  const row = {
    groom_name: clean(body.groomName, 80),
    groom_father: clean(body.groomFather, 80) || null,
    groom_community: clean(body.groomCommunity, 80) || null,
    groom_city: clean(body.groomCity, 80) || null,
    bride_name: clean(body.brideName, 80),
    bride_father: clean(body.brideFather, 80) || null,
    bride_community: clean(body.brideCommunity, 80) || null,
    bride_city: clean(body.brideCity, 80) || null,
    engaged_on: /^\d{4}-\d{2}-\d{2}$/.test(String(body.date ?? '')) ? String(body.date) : new Date().toISOString().slice(0, 10),
    status: 'pending',
    source: 'form',
  }
  if (!row.groom_name || !row.bride_name) return NextResponse.json({ message: 'יש למלא את שם החתן ושם הכלה.' }, { status: 422 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { error } = await admin.from('engagements').insert(row)
  if (error) {
    console.error('engagement insert failed:', error.message)
    return NextResponse.json({ message: 'השליחה נכשלה. נסו שוב.' }, { status: 502 })
  }
  await notifyOwner('בקשה לפרסום מודעת מאורסים', [`${row.groom_name} ו${row.bride_name}`, 'ממתינה לאישור לפני שתופיע באתר.'], '/he/matchmaker')
  return NextResponse.json({ ok: true })
}
