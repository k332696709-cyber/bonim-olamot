export interface MatchmakerSession {
  name: string
  email: string
  role: 'matchmaker' | 'admin'
  matchmakerId?: string
}

const SESSION_KEY = 'matchmaker_session'

export function getSession(): MatchmakerSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MatchmakerSession
  } catch {
    return null
  }
}

export function setSession(data: MatchmakerSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Returns the matchmaker/admin session, rebuilding it from the long-lived Supabase
 * sign-in when the local copy is missing (new tab, cleared storage, another device
 * session...). This is what keeps people signed in without typing the password again.
 */
export async function restoreSession(): Promise<MatchmakerSession | null> {
  const existing = getSession()
  if (existing) return existing
  if (typeof window === 'undefined') return null
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user
    if (!user) return null
    const { data: row } = await supabase
      .from('matchmakers')
      .select('id, first_name, last_name, email, is_admin')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!row) return null
    const session: MatchmakerSession = {
      name: `${(row as any).first_name} ${(row as any).last_name}`,
      email: (row as any).email,
      role: (row as any).is_admin ? 'admin' : 'matchmaker',
      matchmakerId: (row as any).id,
    }
    setSession(session)
    return session
  } catch {
    return null
  }
}
