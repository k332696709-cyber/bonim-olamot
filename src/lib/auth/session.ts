export interface MatchmakerSession {
  name: string
  email: string
  role: 'matchmaker' | 'admin'
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
