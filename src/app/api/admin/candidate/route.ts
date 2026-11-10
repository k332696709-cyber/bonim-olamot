import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * Deletes a candidate's login (used when the administrator deletes their registration, so the
 * email can register again). Only a signed-in administrator can call it, verified on the server.
 */
export async function DELETE(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { userId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const userId = String(body.userId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: callerRow } = await admin.from('matchmakers').select('is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!callerRow?.is_admin) return NextResponse.json({ message: 'אין הרשאה.' }, { status: 403 })

  // Never delete a staff login through this route.
  const { data: staff } = await admin.from('matchmakers').select('id').eq('user_id', userId).maybeSingle()
  if (staff) return NextResponse.json({ message: 'זה חשבון של שדכן/מנהל.' }, { status: 400 })

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error('delete candidate login failed:', error.message)
    return NextResponse.json({ message: 'מחיקת ההתחברות נכשלה.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
