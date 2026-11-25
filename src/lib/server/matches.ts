/* eslint-disable */
// Server-only: a candidate who is in the middle of a match (one that has not come down) cannot be put in
// another match by anyone, so two matchmakers never work on the same person at once.

export const BUSY_MESSAGE = 'אחד המועמדים כבר באמצע שידוך פעיל, ולכן אי אפשר לפתוח לו שידוך נוסף.'

/** The ids, out of the given ones, of candidates who are in an active match. */
export async function busyProfiles(admin: any, ids: string[]): Promise<Set<string>> {
  const list = ids.filter((x) => /^[0-9a-f-]{36}$/i.test(x))
  if (list.length === 0) return new Set()
  const csv = list.join(',')
  const { data } = await admin
    .from('matches')
    .select('female_id, male_id')
    .eq('status', 'active')
    .or(`female_id.in.(${csv}),male_id.in.(${csv})`)
  const busy = new Set<string>()
  for (const m of data ?? []) {
    if (list.includes(m.female_id)) busy.add(m.female_id)
    if (list.includes(m.male_id)) busy.add(m.male_id)
  }
  return busy
}

/**
 * Of the given candidates, those who are in an active match with someone other than `me`, and whether
 * `me` is in an active match with anyone. (A match between `me` and one of them does not make them
 * "busy" for `me`: it is the very match they share.)
 */
export async function busyFor(admin: any, me: string, ids: string[]): Promise<{ meBusy: boolean; others: Set<string> }> {
  const list = Array.from(new Set([me, ...ids])).filter((x) => /^[0-9a-f-]{36}$/i.test(x))
  const csv = list.join(',')
  const { data } = await admin
    .from('matches').select('female_id, male_id')
    .eq('status', 'active')
    .or(`female_id.in.(${csv}),male_id.in.(${csv})`)
  let meBusy = false
  const others = new Set<string>()
  for (const m of data ?? []) {
    if (m.female_id === me || m.male_id === me) { meBusy = true; continue }
    if (list.includes(m.female_id)) others.add(m.female_id)
    if (list.includes(m.male_id)) others.add(m.male_id)
  }
  return { meBusy, others }
}
