import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * The matchmaker handling a match (or the colleague working on it, or an administrator) takes the match
 * off the table ("the proposal came down") or puts it back. Nobody else can touch a match that is open.
 * Body: { matchId, dropped: boolean }.
 */
export async function PATCH(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { matchId?: string; dropped?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchId = String(body.matchId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(matchId) || typeof body.dropped !== 'boolean') {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin.from('matchmakers').select('id, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: match } = await admin.from('matches').select('id, matchmaker_id, co_matchmaker_id').eq('id', matchId).maybeSingle()
  if (!match) return NextResponse.json({ message: 'השידוך לא נמצא.' }, { status: 404 })
  const mine = match.matchmaker_id === mm.id || match.co_matchmaker_id === mm.id
  if (!mm.is_admin && !mine) return NextResponse.json({ message: 'השידוך הזה מטופל על ידי שדכן/ית אחר/ת.' }, { status: 403 })

  // A match that came from a matchmaker's private pool: when it comes down, the person goes back to that
  // private pool (their profile and the match are removed from the site).
  if (body.dropped) {
    const { data: fromPool } = await admin.from('matchmaker_pool').select('id, profile_id').eq('match_id', matchId).maybeSingle()
    if (fromPool) {
      await admin.from('matches').delete().eq('id', matchId)
      if (fromPool.profile_id) await admin.from('profiles').delete().eq('id', fromPool.profile_id)
      await admin.from('matchmaker_pool').update({ profile_id: null, match_id: null }).eq('id', fromPool.id)
      return NextResponse.json({ ok: true, removed: true })
    }
  }

  const { error } = await admin
    .from('matches')
    .update({ status: body.dropped ? 'rejected' : 'active', updated_at: new Date().toISOString() })
    .eq('id', matchId)
  if (error) {
    console.error('match status failed:', error.message)
    return NextResponse.json({ message: 'העדכון נכשל. נסו שוב.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
