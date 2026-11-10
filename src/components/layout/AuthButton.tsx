'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession, type MatchmakerSession } from '@/lib/auth/session'

/**
 * Header button: "My area" for a signed-in matchmaker/admin, otherwise the sign-in link.
 * The sign-in is restored from the saved session, so it shows up on every visit.
 */
export function AuthButton({ locale, className, onClick, fallbackLabel }: {
  locale: string
  className?: string
  onClick?: () => void
  fallbackLabel: string
}) {
  const [session, setSession] = useState<MatchmakerSession | null>(null)
  const he = locale === 'he'

  useEffect(() => {
    let alive = true
    restoreSession().then((s) => { if (alive) setSession(s) })
    return () => { alive = false }
  }, [])

  if (session) {
    return (
      <Link href={`/${locale}/matchmaker`} onClick={onClick} className={className}>
        {session.role === 'admin' ? (he ? 'האזור שלי · מנהל' : 'My area · Admin') : he ? 'האזור שלי' : 'My area'}
      </Link>
    )
  }
  return (
    <Link href={`/${locale}/login`} onClick={onClick} className={className}>
      {fallbackLabel}
    </Link>
  )
}
