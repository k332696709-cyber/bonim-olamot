// Typed query helpers — import createClient from server.ts or client.ts
// and pass the result here.
/* eslint-disable */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

type DB = SupabaseClient<Database>

// ─── Profiles ────────────────────────────────────────────────

export async function getProfilesByMatchmaker(db: DB, matchmakerId: string) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('matchmaker_id', matchmakerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProfileById(db: DB, id: string) {
  const { data, error } = await db
    .from('profiles')
    .select('*, profile_notes(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getProfilesByGender(db: DB, gender: 'male' | 'female') {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('gender', gender)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProfile(
  db: DB,
  profile: Database['public']['Tables']['profiles']['Insert']
) {
  const { data, error } = await db
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  db: DB,
  id: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function lockProfile(db: DB, id: string, lockedBy: string) {
  return updateProfile(db, id, { locked_at: new Date().toISOString(), locked_by: lockedBy })
}

export async function unlockProfile(db: DB, id: string) {
  return updateProfile(db, id, { locked_at: null, locked_by: null })
}

// ─── Matchmakers ─────────────────────────────────────────────

export async function getMatchmakerByUserId(db: DB, userId: string) {
  const { data, error } = await db
    .from('matchmakers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getAllMatchmakers(db: DB) {
  const { data, error } = await db
    .from('matchmakers')
    .select('*')
    .order('first_name')

  if (error) throw error
  return data
}

// ─── Matches ─────────────────────────────────────────────────

export async function getMatchesByMatchmaker(db: DB, matchmakerId: string) {
  const { data, error } = await db
    .from('matches')
    .select(`
      *,
      female:profiles!matches_female_id_fkey(id, first_name, last_name, age, city),
      male:profiles!matches_male_id_fkey(id, first_name, last_name, age, city)
    `)
    .eq('matchmaker_id', matchmakerId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createMatch(
  db: DB,
  match: Database['public']['Tables']['matches']['Insert']
) {
  const { data, error } = await db
    .from('matches')
    .insert(match)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMatchStage(
  db: DB,
  id: string,
  stage: Database['public']['Tables']['matches']['Row']['stage']
) {
  const { data, error } = await db
    .from('matches')
    .update({ stage })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Profile Notes ────────────────────────────────────────────

export async function addNote(
  db: DB,
  note: Database['public']['Tables']['profile_notes']['Insert']
) {
  const { data, error } = await db
    .from('profile_notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Date Spots ───────────────────────────────────────────────

export async function getDateSpots(
  db: DB,
  filters?: { region?: string; category?: string }
) {
  let query = db
    .from('date_spots')
    .select('*, date_spot_reviews(*)')
    .order('average_rating', { ascending: false })

  if (filters?.region)   query = query.eq('region',   filters.region   as Database['public']['Enums']['spot_region'])
  if (filters?.category) query = query.eq('category', filters.category as Database['public']['Enums']['spot_category'])

  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Social Posts ─────────────────────────────────────────────

export async function getSocialPosts(db: DB, limit = 50) {
  const { data, error } = await db
    .from('social_posts')
    .select('*, author:matchmakers(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
