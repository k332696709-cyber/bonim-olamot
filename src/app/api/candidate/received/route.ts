import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'
import { loadReceived } from '@/lib/server/received'

export const runtime = 'nodejs'

/** The proposals a matchmaker opened for the signed-in candidate. */
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const found = await findRegistration(admin, caller.user.id)
  if (!found?.reg.profile_id) return NextResponse.json({ message: 'יש להשלים את שאלון ההיכרות כדי להמשיך.' }, { status: 403 })

  const received = await loadReceived(admin, found.reg.profile_id, found.gender)
  return NextResponse.json({ received })
}
