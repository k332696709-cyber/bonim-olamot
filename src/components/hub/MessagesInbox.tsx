'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Unread { profileId: string | null; name: string; count: number; last: string }

/** Candidates who wrote back and were not read yet. Nothing is shown when there are none. */
export function MessagesInbox({ locale }: { locale: string }) {
  const [list, setList] = useState<Unread[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch('/api/matchmaker/messages', { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        if (res.ok) setList((await res.json()).unread ?? [])
      } catch { /* the messages are still on each candidate's page */ }
    })()
  }, [])

  if (list.length === 0) return null
  const total = list.reduce((n, u) => n + u.count, 0)

  return (
    <div className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-3 border-s-4 border-burgundy-500">
      <h2 className="text-xl font-bold text-navy-800">תשובות חדשות ממועמדים ({total})</h2>
      <ul className="flex flex-col gap-2">
        {list.map((u) => (
          <li key={u.profileId ?? u.name} className="flex items-center justify-between gap-3 rounded-2xl border border-navy-100 px-4 py-3 text-sm">
            <span className="font-semibold text-navy-800">{u.name || 'מועמד/ת'}
              <span className="font-normal text-navy-400"> · {u.count} {u.count === 1 ? 'הודעה חדשה' : 'הודעות חדשות'}</span>
            </span>
            {u.profileId && (
              <Link href={`/${locale}/matchmaker/profiles/${u.profileId}`} className="h-10 px-5 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold inline-flex items-center">
                לקריאה ולמענה
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
