/* eslint-disable */
// Server-only: turns a finished registration into the profile that matchmakers see, or refreshes it.
import { registrationToProfileRow } from '@/lib/registration/toProfile'

/**
 * Creates the profile for a candidate whose questionnaire reached 100%, or updates the existing one.
 * Only the photos the administrator approved are attached. Returns the profile id, or null on failure.
 */
export async function saveProfileFromRegistration(
  admin: any,
  found: { table: string; gender: 'male' | 'female'; reg: { id: string; profile_id: string | null } },
  userId: string,
  answers: Record<string, string>,
): Promise<string | null> {
  const { data: photos } = await admin
    .from('candidate_photos').select('path, is_main').eq('user_id', userId).eq('status', 'approved').order('position')
  const approved: string[] = (photos ?? []).slice().sort((a: any, b: any) => Number(b.is_main) - Number(a.is_main)).map((p: any) => p.path)
  const row = registrationToProfileRow(found.gender, answers, approved)

  if (found.reg.profile_id) {
    const { error } = await admin.from('profiles').update(row).eq('id', found.reg.profile_id)
    if (error) { console.error('profile update failed:', error.message); return null }
    return found.reg.profile_id
  }

  const { data: profile, error } = await admin
    .from('profiles').insert({ ...row, matchmaker_status: 'bright_red' }).select('id').single()
  if (error || !profile) { console.error('profile creation failed:', error?.message); return null }
  await admin.from(found.table).update({ profile_id: profile.id }).eq('id', found.reg.id)
  return profile.id
}
