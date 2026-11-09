'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRegistration, REGISTERED_EVENT } from '@/lib/auth/registration'

/** "Smart Assistant" link, shown only to candidates who have registered in this browser. */
export function SmartNavLink({
  locale, className, onClick, children,
}: { locale: string; className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    const update = () => setRegistered(!!getRegistration())
    update()
    window.addEventListener(REGISTERED_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(REGISTERED_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  if (!registered) return null
  return (
    <Link href={`/${locale}/smart-match`} className={className} onClick={onClick}>
      {children ?? (locale === 'he' ? 'עוזר חכם' : 'Smart Assistant')}
    </Link>
  )
}
