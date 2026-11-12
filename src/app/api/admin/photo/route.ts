import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncCandidatePhotos } from '@/lib/server/photos'

export const runtime = 'nodejs'

/**
 * The administrator approves or rejects one photo. The server verifies the caller is an admin,
 * updates that photo, and refreshes what the profile shows (approved photos only).
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { id?: string; approve?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const id = String(body.id ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(id) || typeof body.approve !== 'boolean') return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: callerRow } = await admin.from('matchmakers').select('is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!callerRow?.is_admin) return NextResponse.json({ message: 'אין הרשאה.' }, { status: 403 })

  const { data: row, error } = await admin
    .from('candidate_photos')
    .update({ status: body.approve ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select('user_id')
    .maybeSingle()
  if (error || !row) return NextResponse.json({ message: 'עדכון התמונה נכשל.' }, { status: 502 })

  await syncCandidatePhotos(admin, row.user_id)
  return NextResponse.json({ ok: true })
}
