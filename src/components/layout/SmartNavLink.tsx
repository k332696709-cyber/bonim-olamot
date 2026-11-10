'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadCandidate } from '@/lib/auth/candidate'
import { createClient } from '@/lib/supabase/client'

/** "Smart Assistant" link, shown only to candidates who have registered in this browser. */
export function SmartNavLink({
  locale, className, onClick, children,
}: { locale: string; className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    let alive = true
    // Shown only to a signed-in candidate whose registration was approved; follows sign-in/out.
    const check = () => loadCandidate().then((c) => { if (alive) setRegistered(c.status === 'approved') })
    check()
    const { data } = createClient().auth.onAuthStateChange(() => { check() })
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [])

  if (!registered) return null
  return (
    <Link href={`/${locale}/smart-match`} className={className} onClick={onClick}>
      {children ?? (locale === 'he' ? 'עוזר חכם' : 'Smart Assistant')}
    </Link>
  )
}
