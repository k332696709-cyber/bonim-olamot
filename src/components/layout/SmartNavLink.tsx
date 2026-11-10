'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadCandidate } from '@/lib/auth/candidate'

/** "Smart Assistant" link, shown only to candidates who have registered in this browser. */
export function SmartNavLink({
  locale, className, onClick, children,
}: { locale: string; className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    let alive = true
    // Shown only to a signed-in candidate whose registration was approved.
    loadCandidate().then((c) => { if (alive) setRegistered(c.status === 'approved') })
    return () => { alive = false }
  }, [])

  if (!registered) return null
  return (
    <Link href={`/${locale}/smart-match`} className={className} onClick={onClick}>
      {children ?? (locale === 'he' ? 'עוזר חכם' : 'Smart Assistant')}
    </Link>
  )
}
