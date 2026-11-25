import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * The matchmaker who handles a match, their colleague on it, or the administrator confirms that the
 * matchmaking fee was received (or takes that back). Only for a match that reached the closing
 * stage with a fee. Body: { matchId, paid }.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { matchId?: unknown; paid?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchId = String(body.matchId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(matchId) || typeof body.paid !== 'boolean') {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin
    .from('matchmakers').select('id, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: match } = await admin
    .from('matches').select('id, stage, fee_amount, matchmaker_id, co_matchmaker_id').eq('id', matchId).maybeSingle()
  if (!match) return NextResponse.json({ message: 'השידוך לא נמצא.' }, { status: 404 })
  if (!mm.is_admin && match.matchmaker_id !== mm.id && match.co_matchmaker_id !== mm.id) {
    return NextResponse.json({ message: 'רק השדכן/ית של השידוך, השותף/ה שלו או המנהל יכולים לאשר.' }, { status: 403 })
  }
  if (match.stage !== 'closing' || !match.fee_amount) {
    return NextResponse.json({ message: 'אפשר לאשר קבלת תשלום רק לשידוך שנסגר ושנשלחו בו דמי שידוך.' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const patch = body.paid
    ? { fee_paid_at: now, fee_paid_by: mm.id, updated_at: now }
    : { fee_paid_at: null, fee_paid_by: null, updated_at: now }
  const { error } = await admin.from('matches').update(patch).eq('id', matchId)
  if (error) {
    console.error('fee paid update failed:', error.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, feePaidAt: body.paid ? now : null })
}
