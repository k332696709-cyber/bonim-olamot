import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * A matchmaker takes over a match that has no matchmaker yet (for example one that opened by itself
 * when both sides pressed "interested"). Body: { matchId }.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { matchId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchId = String(body.matchId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin.from('matchmakers').select('id, first_name, last_name, email').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: match } = await admin.from('matches').select('id, matchmaker_id').eq('id', matchId).maybeSingle()
  if (!match) return NextResponse.json({ message: 'השידוך לא נמצא.' }, { status: 404 })
  if (match.matchmaker_id && match.matchmaker_id !== mm.id) {
    return NextResponse.json({ message: 'השידוך הזה כבר מטופל על ידי שדכן/ית אחר/ת.' }, { status: 409 })
  }

  const { error } = await admin
    .from('matches').update({ matchmaker_id: mm.id, updated_at: new Date().toISOString() }).eq('id', matchId)
  if (error) {
    console.error('claim match failed:', error.message)
    return NextResponse.json({ message: 'הפעולה נכשלה. נסו שוב.' }, { status: 502 })
  }
  return NextResponse.json({
    ok: true,
    patch: { matchmakerId: mm.id, matchmakerName: `${mm.first_name ?? ''} ${mm.last_name ?? ''}`.trim(), matchmakerEmail: mm.email ?? '' },
  })
}
