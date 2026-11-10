import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * Removes a matchmaker completely (their access, their request and their login).
 * Only a signed-in administrator can call it; the check is done on the server with the
 * caller's access token, not in the browser.
 */
export async function DELETE(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { matchmakerId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchmakerId = String(body.matchmakerId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(matchmakerId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // Who is calling, and are they an administrator?
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: callerRow } = await admin.from('matchmakers').select('id, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!callerRow?.is_admin) return NextResponse.json({ message: 'אין הרשאה.' }, { status: 403 })

  const { data: target } = await admin.from('matchmakers').select('id, user_id, email, is_admin').eq('id', matchmakerId).maybeSingle()
  if (!target) return NextResponse.json({ message: 'השדכן לא נמצא.' }, { status: 404 })
  if (target.id === callerRow.id) return NextResponse.json({ message: 'לא ניתן להסיר את עצמך.' }, { status: 400 })
  if (target.is_admin) return NextResponse.json({ message: 'קודם יש להסיר הרשאת מנהל, ורק אז למחוק.' }, { status: 400 })

  try {
    await (admin as any).from('matchmaker_applications').delete().eq('email', target.email)
    const { error: delRow } = await admin.from('matchmakers').delete().eq('id', target.id)
    if (delRow) {
      console.error('delete matchmaker row failed:', delRow.message)
      return NextResponse.json({ message: 'המחיקה נכשלה.' }, { status: 502 })
    }
    if (target.user_id) {
      const { error: delUser } = await admin.auth.admin.deleteUser(target.user_id)
      if (delUser) console.error('delete matchmaker login failed:', delUser.message)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('delete matchmaker error:', e)
    return NextResponse.json({ message: 'אירעה שגיאה.' }, { status: 500 })
  }
}
