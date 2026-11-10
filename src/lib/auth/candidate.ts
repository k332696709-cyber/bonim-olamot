/* eslint-disable */
import { createClient } from '@/lib/supabase/client'
import { mapProfileRow, PROFILE_SELECT } from '@/lib/supabase/mapProfile'
import { allPhotoPaths } from '@/lib/registration/photos'
import type { FemaleProfile, MaleProfile } from '@/types/registration'

export type CandidateStatus = 'signed_out' | 'not_candidate' | 'pending' | 'approved'

export interface CandidateState {
  status: CandidateStatus
  gender?: 'male' | 'female'
  email?: string
  submittedAt?: string
  answers?: Record<string, string>
  photoUrl?: string
  /** All photos, main first. */
  photoUrls?: string[]
  /** pending = waiting for the administrator, approved = visible to others, rejected = upload a new one. */
  photoStatus?: 'pending' | 'approved' | 'rejected'
  /** Own profile, only once the administrator approved the registration. */
  profile?: FemaleProfile | MaleProfile
}

/**
 * Reads the signed-in candidate from Supabase (their own registration, and their own profile
 * once approved). Row-level security guarantees a candidate can only ever read their own rows.
 */
export async function loadCandidate(): Promise<CandidateState> {
  try {
    const db = createClient() as any
    const { data } = await db.auth.getSession()
    const user = data?.session?.user
    if (!user) return { status: 'signed_out' }

    let gender: 'male' | 'female' | null = null
    let reg: any = null
    for (const g of ['male', 'female'] as const) {
      const { data: row } = await db.from(`${g}_registrations`).select('*').eq('user_id', user.id).maybeSingle()
      if (row) { gender = g; reg = row; break }
    }
    if (!reg || !gender) return { status: 'not_candidate', email: user.email }

    const base: CandidateState = {
      status: reg.profile_id ? 'approved' : 'pending',
      gender,
      email: user.email,
      submittedAt: reg.created_at,
      answers: reg.answers,
      photoStatus: reg.photo_status,
    }

    const urls: string[] = []
    for (const path of allPhotoPaths(reg)) {
      const { data: signed } = await db.storage.from('registration-photos').createSignedUrl(path, 3600)
      if (signed?.signedUrl) urls.push(signed.signedUrl)
    }
    if (urls.length) { base.photoUrl = urls[0]; base.photoUrls = urls }

    if (reg.profile_id) {
      const { data: row } = await db.from('profiles').select(PROFILE_SELECT).eq('id', reg.profile_id).maybeSingle()
      if (row) base.profile = mapProfileRow(row)
    }
    return base
  } catch {
    return { status: 'signed_out' }
  }
}
