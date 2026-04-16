'use client'

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchmakerIdentity {
  name: string
  isAdmin: boolean
}

// Demo identities — in production these come from your auth provider
export const DEMO_IDENTITIES: MatchmakerIdentity[] = [
  { name: 'שדכן א',  isAdmin: false },
  { name: 'שדכן ב',  isAdmin: false },
  { name: 'שדכן ג',  isAdmin: false },
  { name: 'מנהל',    isAdmin: true  },
]

const DEFAULT_IDENTITY = DEMO_IDENTITIES[0]
const STORAGE_KEY = 'bonim-matchmaker-identity'

// ─── Context ──────────────────────────────────────────────────────────────────

interface LockContextValue extends MatchmakerIdentity {
  setIdentity: (id: MatchmakerIdentity) => void
}

const LockContext = createContext<LockContextValue>({
  ...DEFAULT_IDENTITY,
  setIdentity: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LockProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentityState] = useState<MatchmakerIdentity>(DEFAULT_IDENTITY)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as MatchmakerIdentity
        if (typeof parsed.name === 'string') setIdentityState(parsed)
      }
    } catch { /* ignore parse errors */ }
  }, [])

  const setIdentity = useCallback((id: MatchmakerIdentity) => {
    setIdentityState(id)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(id)) } catch { /* ignore */ }
  }, [])

  return (
    <LockContext.Provider value={{ name: identity.name, isAdmin: identity.isAdmin, setIdentity }}>
      {children}
    </LockContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLockIdentity(): LockContextValue {
  return useContext(LockContext)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns true if the current user is allowed to act on a lock owned by lockedBy.
 * Admins can always act. Unowned locks (null/undefined) are open to all.
 */
export function canActOnLock(
  lockedBy: string | null | undefined,
  currentName: string,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true
  if (!lockedBy) return true
  return lockedBy === currentName
}
