import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/server/notify'

export const runtime = 'nodejs'

/**
 * Optional cooperation: the matchmaker who handles a match adds a colleague to it (or removes
 * them). The colleague then sees the match and can work on it too. The owner, an admin or the
 * colleague themselves can end the cooperation.
 *
 * Body: { matchId, coMatchmakerId } where coMatchmakerId is null to remove.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { matchId?: unknown; coMatchmakerId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const uuid = /^[0-9a-f-]{36}$/i
  const matchId = String(body.matchId ?? '')
  const coId = body.coMatchmakerId == null ? null : String(body.coMatchmakerId)
  if (!uuid.test(matchId) || (coId !== null && !uuid.test(coId))) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin
    .from('matchmakers').select('id, first_name, last_name, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: match } = await admin.from('matches').select('id, matchmaker_id, co_matchmaker_id').eq('id', matchId).maybeSingle()
  if (!match) return NextResponse.json({ message: 'השידוך לא נמצא.' }, { status: 404 })

  const isOwner = match.matchmaker_id === mm.id
  const isCo = match.co_matchmaker_id === mm.id

  if (coId === null) {
    if (!isOwner && !isCo && !mm.is_admin) return NextResponse.json({ message: 'אין הרשאה.' }, { status: 403 })
  } else {
    if (!isOwner && !mm.is_admin) return NextResponse.json({ message: 'רק השדכן/ית המטפל/ת בשידוך יכול/ה להוסיף שותף/ה.' }, { status: 403 })
    if (coId === match.matchmaker_id) return NextResponse.json({ message: 'השדכן/ית כבר מטפל/ת בשידוך.' }, { status: 400 })
  }

  let colleague: any = null
  if (coId !== null) {
    const { data } = await admin.from('matchmakers').select('id, email, first_name, last_name').eq('id', coId).maybeSingle()
    if (!data) return NextResponse.json({ message: 'השדכן/ית לא נמצא/ה.' }, { status: 404 })
    colleague = data
  }

  const { error } = await admin
    .from('matches').update({ co_matchmaker_id: coId, updated_at: new Date().toISOString() }).eq('id', matchId)
  if (error) {
    console.error('match collaboration save failed:', error.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  // Tell the colleague, without naming the candidates.
  if (colleague) {
    await sendMail(
      colleague.email,
      'שותפות בשידוך',
      [`${`${mm.first_name} ${mm.last_name}`.trim()} הוסיף/ה אותך כשותף/ה לשידוך.`, 'השידוך מופיע עכשיו במעקב השידוכים שלך.'],
      '/he/matchmaker',
    )
  }

  return NextResponse.json({
    ok: true,
    co: colleague ? { id: colleague.id, name: `${colleague.first_name} ${colleague.last_name}`.trim(), email: colleague.email } : null,
  })
}
