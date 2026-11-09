'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/** Admin-only shortcut to the contact inbox, with the number of unread messages. */
export function InboxLink({ locale }: { locale: string }) {
  const [unread, setUnread] = useState<number | null>(null)
  const he = locale === 'he'

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { count } = await (createClient() as any)
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false)
        if (alive) setUnread(count ?? 0)
      } catch {
        if (alive) setUnread(0)
      }
    })()
    return () => { alive = false }
  }, [])

  return (
    <Link
      href={`/${locale}/matchmaker/inbox`}
      className="inline-flex items-center gap-2 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold px-5 h-10 transition-colors"
    >
      ✉ {he ? 'תיבת פניות' : 'Inbox'}
      {!!unread && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-burgundy-400 text-[11px] font-bold flex items-center justify-center">
          {unread}
        </span>
      )}
    </Link>
  )
}
