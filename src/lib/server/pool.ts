/* eslint-disable */
// Server-only: a matchmaker's private pool. Every function here is for the matchmaker who owns the entry.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mapProfileRow } from '@/lib/supabase/mapProfile'
import { buildProposals, type AnyProfile, type Proposal } from '@/lib/matchmaking/assistant'
import { respectsPreferences } from '@/lib/matchmaking/preferences'
import { registrationToProfileRow } from '@/lib/registration/toProfile'
import { busyProfiles } from '@/lib/server/matches'
import { PHOTO_BUCKET } from '@/lib/server/photos'

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) as any
}

/** The signed-in matchmaker (administrators have their own pool like everyone else), or an error response. */
export async function poolOwner(req: NextRequest): Promise<{ admin: any; mm: { id: string; first_name: string; last_name: string } } | { error: NextResponse }> {
  const admin = adminClient()
  if (!admin) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: mm } = await admin.from('matchmakers').select('id, first_name, last_name').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return { error: NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 }) }
  return { admin, mm }
}

/** One entry of the signed-in matchmaker only; null when it is not theirs. */
export async function ownEntry(admin: any, mmId: string, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await admin.from('matchmaker_pool').select('*').eq('id', id).eq('matchmaker_id', mmId).maybeSingle()
  return data ?? null
}

/** The profile row a pool entry would become on the site. */
export function entryToProfileRow(entry: any) {
  return registrationToProfileRow(entry.gender, entry.answers ?? {}, entry.photo_paths ?? [])
}

export { PHOTO_BUCKET }

export interface PoolSuggestion {
  id: string
  name: string
  age: number
  city: string
  community: string
  score: number
  highlights: string[]
  conflicts: string[]
}

/** Profiles on the site that fit a pool entry, best first. People in the middle of a match are left out. */
export async function suggestionsFor(admin: any, entry: any): Promise<PoolSuggestion[]> {
  const row = entryToProfileRow(entry)
  const me = mapProfileRow({ id: entry.id, ...row, created_at: entry.created_at }) as AnyProfile
  const otherGender = entry.gender === 'male' ? 'female' : 'male'
  const { data: rows } = await admin.from('profiles').select('*').eq('gender', otherGender)
  const busy = await busyProfiles(admin, (rows ?? []).map((r: any) => r.id))
  const free = (rows ?? []).filter((r: any) => !busy.has(r.id))

  const otherTable = entry.gender === 'male' ? 'female_registrations' : 'male_registrations'
  const ids = free.map((r: any) => r.id)
  const { data: regs } = ids.length ? await admin.from(otherTable).select('profile_id, answers').in('profile_id', ids) : { data: [] }
  const regOf = new Map<string, Record<string, string>>((regs ?? []).map((r: any) => [r.profile_id, r.answers ?? {}]))

  const out: Proposal[] = []
  for (const r of free) {
    const a = regOf.get(r.id) ?? null
    const text = [r.community, a?.edah, a?.community, a?.hasidut].filter(Boolean).join(' ')
    const ok = respectsPreferences({
      myGender: entry.gender, myCity: entry.answers?.city ?? '', otherCity: r.city ?? '',
      myAge: Number(row.age) || 0, myAnswers: entry.answers ?? {}, otherAge: Number(r.age) || 0, otherText: text, otherAnswers: a,
    })
    if (!ok) continue
    try { out.push(...buildProposals(me, [mapProfileRow(r) as AnyProfile])) } catch { /* skip a profile the engine cannot read */ }
  }
  out.sort((a, b) => b.score - a.score)
  return out.slice(0, 8).map((p) => ({
    id: p.id, name: p.name, age: p.age, city: p.city, community: p.community, score: p.score,
    highlights: p.highlightsHe, conflicts: p.conflictsHe,
  }))
}
