import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'

export const runtime = 'nodejs'

async function whoIs(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const found = await findRegistration(admin, caller.user.id)
  const profileId: string | undefined = found?.reg.profile_id
  if (!found || !profileId) return { error: NextResponse.json({ message: 'ההרשמה עדיין ממתינה לאישור.' }, { status: 403 }) }
  return { admin, gender: found.gender, profileId }
}

/** Matchmaking-fee notices addressed to the signed-in candidate (sent by a matchmaker). */
export async function GET(req: NextRequest) {
  const w = await whoIs(req)
  if ('error' in w) return w.error
  const col = w.gender === 'female' ? 'female_id' : 'male_id'
  const { data: rows } = await w.admin
    .from('matches')
    .select('id, fee_amount, fee_sent_at, fee_female_ack_at, fee_male_ack_at, matchmakers(first_name, last_name)')
    .eq(col, w.profileId)
    .not('fee_sent_at', 'is', null)
    .order('fee_sent_at', { ascending: false })

  const fees = (rows ?? []).map((r: any) => ({
    id: r.id,
    amount: r.fee_amount,
    sentAt: r.fee_sent_at,
    matchmaker: r.matchmakers ? `${r.matchmakers.first_name} ${r.matchmakers.last_name}`.trim() : '',
    acknowledged: !!(w.gender === 'female' ? r.fee_female_ack_at : r.fee_male_ack_at),
  }))
  return NextResponse.json({ fees })
}

/** The candidate confirms they saw the amount. Body: { matchId }. */
export async function POST(req: NextRequest) {
  const w = await whoIs(req)
  if ('error' in w) return w.error
  let body: { matchId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchId = String(body.matchId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const own = w.gender === 'female' ? 'female_id' : 'male_id'
  const ackCol = w.gender === 'female' ? 'fee_female_ack_at' : 'fee_male_ack_at'
  const { data, error } = await w.admin
    .from('matches')
    .update({ [ackCol]: new Date().toISOString() })
    .eq('id', matchId)
    .eq(own, w.profileId)
    .not('fee_sent_at', 'is', null)
    .select('id')
  if (error || !data || data.length === 0) return NextResponse.json({ message: 'לא נמצא עדכון לאישור.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
