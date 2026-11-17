import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'

export const runtime = 'nodejs'

/** The candidate switches SMS updates and phone calls on or off. Email updates are always on. */
export async function PUT(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { notifySms?: unknown; notifyCalls?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const found = await findRegistration(admin, caller.user.id)
  if (!found) return NextResponse.json({ message: 'לא נמצאה הרשמה.' }, { status: 404 })

  const updates: Record<string, string> = {}
  for (const k of ['notifySms', 'notifyCalls'] as const) {
    if (body[k] === undefined) continue
    if (typeof body[k] !== 'boolean') return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
    updates[k] = body[k] ? '1' : '0'
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const merged = { ...(found.reg.answers ?? {}), ...updates }
  const { error } = await admin.from(found.table).update({ answers: merged }).eq('id', found.reg.id)
  if (error) {
    console.error('preferences save failed:', error.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
