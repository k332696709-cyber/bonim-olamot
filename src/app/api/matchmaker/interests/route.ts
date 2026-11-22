import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * Interest that candidates expressed in the smart assistant, for the matchmakers' dashboard:
 * who pressed "interested" in whom, whether it is mutual, and whether a match is already open.
 * Open to any signed-in matchmaker or admin.
 */
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin.from('matchmakers').select('id').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: ints } = await admin
    .from('match_interests').select('from_profile_id, to_profile_id, created_at')
    .eq('kind', 'interested').order('created_at', { ascending: false }).limit(300)
  const rows = ints ?? []
  if (rows.length === 0) return NextResponse.json({ interests: [] })

  const ids = Array.from(new Set(rows.flatMap((r: any) => [r.from_profile_id, r.to_profile_id])))
  const { data: people } = await admin.from('profiles').select('id, gender, first_name, last_name, age, city').in('id', ids)
  const byId = new Map<string, any>((people ?? []).map((p: any) => [p.id, p]))
  const { data: matches } = await admin
    .from('matches')
    .select('id, female_id, male_id, stage, status, updated_at, matchmaker_id, matchmakers!matches_matchmaker_id_fkey(first_name, last_name, email)')
    .in('female_id', ids)
  const matchOf = new Map<string, any>((matches ?? []).map((m: any) => [`${m.female_id}|${m.male_id}`, m]))

  const key = (a: string, b: string) => [a, b].sort().join('|')
  const seen = new Set<string>()
  const pairSet = new Set(rows.map((r: any) => `${r.from_profile_id}>${r.to_profile_id}`))
  const out: any[] = []
  for (const r of rows) {
    const k = key(r.from_profile_id, r.to_profile_id)
    const mutual = pairSet.has(`${r.to_profile_id}>${r.from_profile_id}`)
    if (mutual) { if (seen.has(k)) continue; seen.add(k) }
    const from = byId.get(r.from_profile_id)
    const to = byId.get(r.to_profile_id)
    if (!from || !to) continue
    const female = from.gender === 'female' ? from : to
    const male = from.gender === 'male' ? from : to
    const brief = (p: any) => ({ id: p.id, name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(), age: p.age ?? null, city: p.city ?? '' })
    out.push({
      at: r.created_at,
      mutual,
      from: brief(from),
      to: brief(to),
      femaleId: female.id,
      maleId: male.id,
      matchId: matchOf.get(`${female.id}|${male.id}`)?.id ?? null,
      match: (() => {
        const m = matchOf.get(`${female.id}|${male.id}`)
        if (!m) return null
        return {
          id: m.id, femaleId: female.id, maleId: male.id, stage: m.stage, status: m.status, updatedAt: m.updated_at,
          matchmakerId: m.matchmaker_id ?? null,
          matchmakerName: m.matchmakers ? `${m.matchmakers.first_name ?? ''} ${m.matchmakers.last_name ?? ''}`.trim() : '',
          matchmakerEmail: m.matchmakers?.email ?? '',
        }
      })(),
    })
  }
  return NextResponse.json({ interests: out })
}
