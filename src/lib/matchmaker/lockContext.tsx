'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSession } from '@/lib/auth/session'

export interface MatchmakerIdentity {
  name: string
  isAdmin: boolean
}

interface LockContextValue extends MatchmakerIdentity {
  setIdentity: (id: MatchmakerIdentity) => void
}

const LockContext = createContext<LockContextValue>({
  name: '',
  isAdmin: false,
  setIdentity: () => {},
})

export function LockProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentityState] = useState<MatchmakerIdentity>({ name: '', isAdmin: false })

  useEffect(() => {
    const session = getSession()
    if (session) {
      setIdentityState({ name: session.name, isAdmin: session.role === 'admin' })
    }
  }, [])

  return (
    <LockContext.Provider value={{ ...identity, setIdentity: setIdentityState }}>
      {children}
    </LockContext.Provider>
  )
}

export function useLockIdentity(): LockContextValue {
  return useContext(LockContext)
}

export function canActOnLock(
  lockedBy: string | null | undefined,
  currentName: string,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true
  if (!lockedBy) return true
  return lockedBy === currentName
}
