/* eslint-disable */
// Server-only: builds the anonymous proposals a candidate sees. Other people's full profiles
// are read with the service role and never leave the server; only the safe fields below do.
import { mapProfileRow } from '@/lib/supabase/mapProfile'
import { buildProposals, MIN_MATCH_SCORE, styleRank, type AnyProfile, type Proposal } from '@/lib/matchmaking/assistant'
import { cityCoords, distanceKm } from '@/constants/cityCoords'
import { respectsPreferences } from '@/lib/matchmaking/preferences'

export type ProposalState = 'none' | 'interested' | 'mutual' | 'passed'
export interface LiveProposal extends Proposal { state: ProposalState }

const LOCK_MS = 48 * 60 * 60 * 1000

export async function loadProposals(admin: any, myProfileId: string): Promise<{ me: AnyProfile; proposals: LiveProposal[]; learned: string[]; interestedInMe: number } | null> {
  const { data: meRow } = await admin.from('profiles').select('*').eq('id', myProfileId).maybeSingle()
  if (!meRow) return null
  const me = mapProfileRow(meRow) as AnyProfile

  const otherGender = meRow.gender === 'male' ? 'female' : 'male'
  const { data: rows } = await admin.from('profiles').select('*').eq('gender', otherGender)
  const now = Date.now()
  const pool = (rows ?? [])
    // A profile a matchmaker is working on right now is not offered to others.
    .filter((r: any) => !(r.locked_at && new Date(r.locked_at).getTime() + LOCK_MS > now))
    .map((r: any) => mapProfileRow(r) as AnyProfile)

  // What each side wrote about who they want (age range, community or edah) is a hard rule: the
  // assistant never offers someone who breaks it. This applies to candidates only.
  const myTable = meRow.gender === 'male' ? 'male_registrations' : 'female_registrations'
  const otherTable = meRow.gender === 'male' ? 'female_registrations' : 'male_registrations'
  const { data: myReg } = await admin.from(myTable).select('answers').eq('profile_id', myProfileId).maybeSingle()
  const myAnswers: Record<string, string> = myReg?.answers ?? {}
  const poolIds = pool.map((r: any) => r.id)
  const { data: otherRegs } = poolIds.length
    ? await admin.from(otherTable).select('profile_id, answers').in('profile_id', poolIds)
    : { data: [] }
  const regOf = new Map<string, Record<string, string>>((otherRegs ?? []).map((r: any) => [r.profile_id, r.answers ?? {}]))
  const okPool = pool.filter((r: any) => {
    const a = regOf.get(r.id) ?? null
    const text = [r.community, a?.edah, a?.community, a?.hasidut].filter(Boolean).join(' ')
    return respectsPreferences({
      myGender: meRow.gender, myCity: meRow.city ?? '', otherCity: r.city ?? '',
      myAge: Number(meRow.age) || 0, myAnswers, otherAge: Number(r.age) || 0, otherText: text, otherAnswers: a,
    })
  })

  const scored: Proposal[] = []
  for (const p of okPool) {
    try { scored.push(...buildProposals(me, [p])) } catch { /* a profile the engine cannot read is skipped */ }
  }
  scored.sort((a, b) => b.score - a.score)

  const { data: ints } = await admin
    .from('match_interests').select('from_profile_id, to_profile_id, kind')
    .or(`from_profile_id.eq.${myProfileId},to_profile_id.eq.${myProfileId}`)
  const mine = new Map<string, string>()
  const theirs = new Set<string>()
  for (const i of ints ?? []) {
    if (i.from_profile_id === myProfileId) mine.set(i.to_profile_id, i.kind)
    else if (i.kind === 'interested') theirs.add(i.from_profile_id)
  }

  // What the assistant learned from the reasons given for "not now".
  const { data: passes } = await admin
    .from('match_interests').select('to_profile_id, reason')
    .eq('from_profile_id', myProfileId).eq('kind', 'passed').not('reason', 'is', null)
  const learned: string[] = []
  const rules: ((p: Proposal) => boolean)[] = []
  const byId = new Map<string, any>((rows ?? []).map((r: any) => [r.id, r]))
  const rejected = (code: string) => (passes ?? []).filter((x: any) => x.reason === code).map((x: any) => byId.get(x.to_profile_id)).filter(Boolean)
  const young = rejected('age_young').map((r: any) => Number(r.age)).filter(Boolean)
  if (young.length) { const t = Math.max(...young); rules.push((p) => p.age <= t); learned.push(`פחות הצעות בנות ${t} ומטה`) }
  const old = rejected('age_old').map((r: any) => Number(r.age)).filter(Boolean)
  if (old.length) { const t = Math.min(...old); rules.push((p) => p.age >= t); learned.push(`פחות הצעות בנות ${t} ומעלה`) }
  const myCoords = cityCoords(meRow.city)
  const farKm = myCoords ? rejected('far').map((r: any) => { const c = cityCoords(r.city); return c ? distanceKm(myCoords, c) : null }).filter((x: any) => x !== null) as number[] : []
  if (myCoords && farKm.length) {
    const t = Math.min(...farKm)
    rules.push((p) => { const c = cityCoords(p.city); return !!c && distanceKm(myCoords, c) >= t })
    learned.push(`פחות הצעות ממרחק של כ-${Math.round(t)} ק״מ ומעלה`)
  }
  const open = rejected('style_open').map((r: any) => styleRank(r.style ?? ''))
  if (open.length) { const t = Math.min(...open); rules.push((p) => styleRank(p.style) >= t); learned.push('פחות הצעות בסגנון פתוח יותר') }
  const cons = rejected('style_conservative').map((r: any) => styleRank(r.style ?? ''))
  if (cons.length) { const t = Math.max(...cons); rules.push((p) => styleRank(p.style) <= t); learned.push('פחות הצעות בסגנון שמור יותר') }
  if (rules.length) {
    for (const p of scored) {
      const hits = rules.filter((rule) => rule(p)).length
      if (hits) p.score = Math.max(0, p.score - 20 * hits)
    }
    scored.sort((a, b) => b.score - a.score)
  }
  // Only real matches are offered: nobody gets everyone who registered.
  for (let i = scored.length - 1; i >= 0; i--) if (scored[i].score < MIN_MATCH_SCORE) scored.splice(i, 1)

  const proposals: LiveProposal[] = scored.map((p) => {
    const kind = mine.get(p.id)
    const state: ProposalState =
      kind === 'interested' ? (theirs.has(p.id) ? 'mutual' : 'interested') : kind === 'passed' ? 'passed' : 'none'
    return { ...p, state }
  })
  const interestedInMe = Array.from(theirs).filter((id) => !mine.has(id) && byId.has(id)).length
  return { me, proposals, learned, interestedInMe }
}
