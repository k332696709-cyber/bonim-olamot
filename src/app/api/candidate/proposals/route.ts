import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'
import { loadProposals } from '@/lib/server/proposals'

export const runtime = 'nodejs'

/** Anonymous match proposals for the signed-in, approved candidate. */
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
  if (!found?.reg.profile_id) return NextResponse.json({ message: 'ההרשמה עדיין ממתינה לאישור.' }, { status: 403 })

  const result = await loadProposals(admin, found.reg.profile_id)
  if (!result) return NextResponse.json({ message: 'הפרופיל לא נמצא.' }, { status: 404 })
  return NextResponse.json({ proposals: result.proposals })
}
