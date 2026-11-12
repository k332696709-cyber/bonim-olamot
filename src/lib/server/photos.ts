/* eslint-disable */
// Server-only helpers for candidate photos (they use the service-role client).

export const PHOTO_BUCKET = 'registration-photos'
export const MAX_SLOTS = 5

const TABLES = ['male_registrations', 'female_registrations'] as const

/** The candidate's own registration row (men's or women's), found by their login. */
export async function findRegistration(admin: any, userId: string) {
  for (const table of TABLES) {
    const { data } = await admin.from(table).select('id, profile_id, answers').eq('user_id', userId).maybeSingle()
    if (data) return { table, gender: table === 'male_registrations' ? ('male' as const) : ('female' as const), reg: data }
  }
  return null
}

/**
 * Keeps the columns that other parts of the app read in line with the per-photo rows:
 * the registration keeps every photo path and an overall status, and the profile that matchmakers
 * see lists only the approved photos.
 */
export async function syncCandidatePhotos(admin: any, userId: string) {
  const { data: rows } = await admin.from('candidate_photos').select('path, status, position, is_main').eq('user_id', userId).order('position')
  // The photo the candidate chose as main comes first, the rest by box number.
  const list: { path: string; status: string; is_main: boolean }[] = (rows ?? []).slice().sort((a: any, b: any) => Number(b.is_main) - Number(a.is_main))
  const found = await findRegistration(admin, userId)
  if (!found) return

  const all = list.map((r) => r.path)
  const approved = list.filter((r) => r.status === 'approved').map((r) => r.path)
  const status = list.some((r) => r.status === 'pending')
    ? 'pending'
    : approved.length > 0
      ? 'approved'
      : list.length > 0
        ? 'rejected'
        : 'pending'

  await admin
    .from(found.table)
    .update({ photo_path: all[0] ?? '', extra_photo_paths: all.slice(1), photo_status: status })
    .eq('id', found.reg.id)
  if (found.reg.profile_id) await admin.from('profiles').update({ photos: approved }).eq('id', found.reg.profile_id)
}

export function photoExtension(name: string): string {
  return (name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
}
