'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

type Who = { kind: 'none' } | { kind: 'staff'; admin: boolean } | { kind: 'candidate' }

/**
 * Header button: "My area" for a signed-in matchmaker/admin or candidate, otherwise the
 * sign-in link. It follows sign-in / sign-out immediately (no page reload needed).
 */
export function AuthButton({ locale, className, onClick, fallbackLabel }: {
  locale: string
  className?: string
  onClick?: () => void
  fallbackLabel: string
}) {
  const [who, setWho] = useState<Who>({ kind: 'none' })
  const he = locale === 'he'

  const refresh = useCallback(async () => {
    const staff = await restoreSession()
    if (staff) return setWho({ kind: 'staff', admin: staff.role === 'admin' })
    const { data } = await createClient().auth.getSession()
    setWho(data.session?.user ? { kind: 'candidate' } : { kind: 'none' })
  }, [])

  useEffect(() => {
    refresh()
    const { data } = createClient().auth.onAuthStateChange(() => { refresh() })
    return () => data.subscription.unsubscribe()
  }, [refresh])

  if (who.kind === 'staff') {
    return (
      <Link href={`/${locale}/matchmaker`} onClick={onClick} className={className}>
        {who.admin ? (he ? 'האזור שלי · מנהל' : 'My area · Admin') : he ? 'האזור שלי' : 'My area'}
      </Link>
    )
  }
  if (who.kind === 'candidate') {
    return (
      <Link href={`/${locale}/personal`} onClick={onClick} className={className}>
        {he ? 'האזור שלי' : 'My area'}
      </Link>
    )
  }
  return (
    <Link href={`/${locale}/login`} onClick={onClick} className={className}>
      {fallbackLabel}
    </Link>
  )
}
