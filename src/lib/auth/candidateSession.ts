export interface CandidateSession {
  id: string
  gender: 'male' | 'female'
  firstName: string
  age: number
  city: string
  community: string
  occupation: string
  style: string
  status: 'active' | 'paused'
}

const KEY = 'candidate_session'

export function getCandidateSession(): CandidateSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CandidateSession) : null
  } catch {
    return null
  }
}

export function setCandidateSession(data: CandidateSession): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function updateCandidateStatus(status: 'active' | 'paused'): void {
  const session = getCandidateSession()
  if (session) setCandidateSession({ ...session, status })
}

export function clearCandidateSession(): void {
  localStorage.removeItem(KEY)
}

// Demo sessions — used until real auth is wired up
export const DEMO_SESSIONS: Record<'male' | 'female', CandidateSession> = {
  male: {
    id: 'm-demo',
    gender: 'male',
    firstName: 'דוד',
    age: 26,
    city: 'ירושלים',
    community: 'דתי לאומי',
    occupation: 'מהנדס תוכנה',
    style: 'modern',
    status: 'active',
  },
  female: {
    id: 'f-demo',
    gender: 'female',
    firstName: 'שרה',
    age: 23,
    city: 'בני ברק',
    community: 'חרדי – ליטאי',
    occupation: 'מורה',
    style: 'shmura',
    status: 'active',
  },
}
