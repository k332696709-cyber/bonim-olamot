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

/** Shortcut to the photo review queue, with the number of photos waiting. */
function PhotosLink({ locale, cls }: { locale: string; cls: string }) {
  const [waiting, setWaiting] = useState<number | null>(null)
  const he = locale === 'he'

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const db = createClient() as any
        let total = 0
        for (const t of ['male_registrations', 'female_registrations']) {
          const { count } = await db.from(t).select('id', { count: 'exact', head: true }).eq('photo_status', 'pending')
          total += count ?? 0
        }
        if (alive) setWaiting(total)
      } catch {
        if (alive) setWaiting(0)
      }
    })()
    return () => { alive = false }
  }, [])

  return (
    <Link href={`/${locale}/matchmaker/photos`} className={cls}>
      {he ? 'תמונות לאישור' : 'Photos'}
      {!!waiting && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-burgundy-500 text-white text-[11px] font-bold flex items-center justify-center">
          {waiting}
        </span>
      )}
    </Link>
  )
}

/** Admin shortcuts: inbox, photos to review, website registrations, team. */
export function AdminLinks({ locale }: { locale: string }) {
  const he = locale === 'he'
  const cls = 'inline-flex items-center gap-2 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold px-5 h-10 transition-colors'
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <InboxLink locale={locale} />
      <PhotosLink locale={locale} cls={cls} />
      <Link href={`/${locale}/matchmaker/registrations`} className={cls}>{he ? 'הרשמות' : 'Registrations'}</Link>
      <Link href={`/${locale}/matchmaker/team`} className={cls}>{he ? 'צוות' : 'Team'}</Link>
    </div>
  )
}
