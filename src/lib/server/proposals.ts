/* eslint-disable */
// Server-only: builds the anonymous proposals a candidate sees. Other people's full profiles
// are read with the service role and never leave the server; only the safe fields below do.
import { mapProfileRow } from '@/lib/supabase/mapProfile'
import { buildProposals, type AnyProfile, type Proposal } from '@/lib/matchmaking/assistant'

export type ProposalState = 'none' | 'interested' | 'mutual' | 'passed'
export interface LiveProposal extends Proposal { state: ProposalState }

const LOCK_MS = 48 * 60 * 60 * 1000

export async function loadProposals(admin: any, myProfileId: string): Promise<{ me: AnyProfile; proposals: LiveProposal[] } | null> {
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

  const scored: Proposal[] = []
  for (const p of pool) {
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

  const proposals: LiveProposal[] = scored.map((p) => {
    const kind = mine.get(p.id)
    const state: ProposalState =
      kind === 'interested' ? (theirs.has(p.id) ? 'mutual' : 'interested') : kind === 'passed' ? 'passed' : 'none'
    return { ...p, state }
  })
  return { me, proposals }
}
