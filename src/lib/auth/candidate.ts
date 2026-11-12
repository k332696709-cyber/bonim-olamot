/* eslint-disable */
import { createClient } from '@/lib/supabase/client'
import { mapProfileRow, PROFILE_SELECT } from '@/lib/supabase/mapProfile'
import type { FemaleProfile, MaleProfile } from '@/types/registration'

export type CandidateStatus = 'signed_out' | 'not_candidate' | 'pending' | 'approved'

export interface CandidatePhoto {
  id: string
  /** Box number, 0 to 4 (0 is the main photo). */
  slot: number
  status: 'pending' | 'approved' | 'rejected'
  url: string
  /** The photo the candidate chose as their main one. */
  main: boolean
}

export interface CandidateState {
  status: CandidateStatus
  gender?: 'male' | 'female'
  email?: string
  submittedAt?: string
  answers?: Record<string, string>
  photoUrl?: string
  /** All photos, main first. */
  photoUrls?: string[]
  /** The five photo boxes, each with its own review status. */
  photos?: CandidatePhoto[]
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

    const { data: photoRows } = await db
      .from('candidate_photos').select('id, path, position, status, is_main').eq('user_id', user.id).order('position')
    const photos: CandidatePhoto[] = []
    for (const r of photoRows ?? []) {
      const { data: signed } = await db.storage.from('registration-photos').createSignedUrl(r.path, 3600)
      photos.push({ id: r.id, slot: r.position, status: r.status, url: signed?.signedUrl ?? '', main: !!r.is_main })
    }
    base.photos = photos
    base.photoUrls = photos.map((x) => x.url).filter(Boolean)
    base.photoUrl = (photos.find((x) => x.main) ?? photos[0])?.url || undefined

    if (reg.profile_id) {
      const { data: row } = await db.from('profiles').select(PROFILE_SELECT).eq('id', reg.profile_id).maybeSingle()
      if (row) base.profile = mapProfileRow(row)
    }
    return base
  } catch {
    return { status: 'signed_out' }
  }
}
