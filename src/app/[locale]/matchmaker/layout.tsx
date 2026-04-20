'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LockProvider } from '@/lib/matchmaker/lockContext'
import { getSession } from '@/lib/auth/session'

export default function MatchmakerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'he'
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace(`/${locale}/login`)
    } else {
      setAuthorized(true)
    }
  }, [locale, router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">טוען...</p>
        </div>
      </div>
    )
  }

  return <LockProvider>{children}</LockProvider>
}
