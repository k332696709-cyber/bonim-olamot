/* eslint-disable */
// Server-only: the proposals a matchmaker opened for this candidate ("proposals I received").
// Each one carries the basic details of the other person, the matchmaker handling it (no phone or
// email) and, once sent, the matchmaking fee for that specific match.

export interface ReceivedMatch {
  matchId: string
  stage: string
  updatedAt: string
  mutual: boolean
  other: { id: string; name: string; age: number | null; city: string; community: string; occupation: string; style: string; gender: 'male' | 'female' }
  matchmaker: MatchmakerCard | null
  coMatchmaker: MatchmakerCard | null
  fee: { amount: number; sentAt: string; acknowledged: boolean } | null
}

export interface MatchmakerCard {
  name: string
  city: string
  biography: string
  specialties: string[]
  languages: string
  yearsExperience: number | null
  matchesClosed: number | null
}

export async function loadReceived(admin: any, myProfileId: string, myGender: 'male' | 'female'): Promise<ReceivedMatch[]> {
  const col = myGender === 'female' ? 'female_id' : 'male_id'
  const { data: rows } = await admin
    .from('matches')
    .select('id, female_id, male_id, stage, updated_at, fee_amount, fee_sent_at, fee_female_ack_at, fee_male_ack_at, matchmakers!matches_matchmaker_id_fkey(email, first_name, last_name), co:matchmakers!matches_co_matchmaker_id_fkey(email, first_name, last_name)')
    .eq(col, myProfileId)
    .neq('status', 'rejected')
    .order('updated_at', { ascending: false })
  if (!rows || rows.length === 0) return []

  const otherIds = rows.map((r: any) => (myGender === 'female' ? r.male_id : r.female_id))
  const { data: people } = await admin
    .from('profiles').select('id, gender, first_name, last_name, age, city, community, occupation, style').in('id', otherIds)
  const byId = new Map<string, any>((people ?? []).map((p: any) => [p.id, p]))

  const { data: ints } = await admin
    .from('match_interests').select('from_profile_id, to_profile_id')
    .eq('kind', 'interested')
    .in('from_profile_id', [myProfileId, ...otherIds])
    .in('to_profile_id', [myProfileId, ...otherIds])
  const pairs = new Set((ints ?? []).map((i: any) => `${i.from_profile_id}>${i.to_profile_id}`))

  const emails = rows.flatMap((r: any) => [r.matchmakers?.email, r.co?.email]).filter(Boolean).map((e: string) => e.toLowerCase())
  const { data: apps } = emails.length
    ? await admin
        .from('matchmaker_applications')
        .select('email, city, biography, specialties, languages, years_experience, matches_closed')
        .eq('status', 'approved')
    : { data: [] }
  const appByEmail = new Map<string, any>((apps ?? []).map((a: any) => [String(a.email).toLowerCase(), a]))

  const card = (m: any): MatchmakerCard | null => {
    if (!m) return null
    const a = appByEmail.get(String(m.email ?? '').toLowerCase())
    return {
      name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
      city: a?.city ?? '',
      biography: a?.biography ?? '',
      specialties: a?.specialties ?? [],
      languages: a?.languages ?? '',
      yearsExperience: a?.years_experience ?? null,
      matchesClosed: a?.matches_closed ?? null,
    }
  }

  const out: ReceivedMatch[] = []
  for (const r of rows) {
    const otherId = myGender === 'female' ? r.male_id : r.female_id
    const o = byId.get(otherId)
    if (!o) continue
    const ack = myGender === 'female' ? r.fee_female_ack_at : r.fee_male_ack_at
    out.push({
      matchId: r.id,
      stage: r.stage,
      updatedAt: r.updated_at,
      mutual: pairs.has(`${myProfileId}>${otherId}`) && pairs.has(`${otherId}>${myProfileId}`),
      other: {
        id: o.id, gender: o.gender, name: `${o.first_name ?? ''} ${o.last_name ?? ''}`.trim(), age: o.age ?? null,
        city: o.city ?? '', community: o.community ?? '', occupation: o.occupation ?? '', style: o.style ?? '',
      },
      matchmaker: card(r.matchmakers),
      coMatchmaker: card(r.co),
      fee: r.fee_sent_at ? { amount: r.fee_amount, sentAt: r.fee_sent_at, acknowledged: !!ack } : null,
    })
  }
  return out
}
