import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyCandidate } from '@/lib/server/candidateNotify'

export const runtime = 'nodejs'

/**
 * A matchmaker opens a match between two candidates (for example from the interest feed). From then
 * on it appears in both candidates' "proposals I received", with the matchmaker's details.
 * Body: { femaleId, maleId }.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { femaleId?: string; maleId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const femaleId = String(body.femaleId ?? '')
  const maleId = String(body.maleId ?? '')
  const uuid = /^[0-9a-f-]{36}$/i
  if (!uuid.test(femaleId) || !uuid.test(maleId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin.from('matchmakers').select('id, first_name, last_name').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: pair } = await admin.from('profiles').select('id, gender').in('id', [femaleId, maleId])
  const f = (pair ?? []).find((p: any) => p.id === femaleId)
  const m = (pair ?? []).find((p: any) => p.id === maleId)
  if (!f || !m || f.gender !== 'female' || m.gender !== 'male') {
    return NextResponse.json({ message: 'יש לבחור מיועדת ומיועד.' }, { status: 422 })
  }

  const { data: existing } = await admin.from('matches').select('id').eq('female_id', femaleId).eq('male_id', maleId).maybeSingle()
  if (existing) return NextResponse.json({ ok: true, matchId: existing.id, created: false })

  const { data: created, error } = await admin
    .from('matches').insert({ female_id: femaleId, male_id: maleId, matchmaker_id: mm.id }).select('id').single()
  if (error || !created) {
    console.error('open match failed:', error?.message)
    return NextResponse.json({ message: 'פתיחת השידוך נכשלה. נסו שוב.' }, { status: 502 })
  }

  const who = `${mm.first_name ?? ''} ${mm.last_name ?? ''}`.trim()
  await Promise.all([
    notifyCandidate(admin, femaleId, 'matchOpened', { who }),
    notifyCandidate(admin, maleId, 'matchOpened', { who }),
  ])
  return NextResponse.json({ ok: true, matchId: created.id, created: true })
}
