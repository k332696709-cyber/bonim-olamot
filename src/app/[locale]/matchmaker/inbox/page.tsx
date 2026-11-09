'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  created_at: string
  name: string
  phone: string
  subject: string
  message: string
  is_read: boolean
}

/** System administrator's inbox for messages left through the website contact form. */
export default function InboxPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [open, setOpen] = useState<string | null>(null)

  const db = () => createClient() as any

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await db()
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (err) {
      setError(he ? 'לא ניתן לטעון את הפניות. ודאו שהרצתם את קובץ ה-SQL של תיבת הפניות.' : 'Could not load messages. Make sure the inbox SQL migration has been run.')
      setMsgs([])
    } else {
      setMsgs(data ?? [])
    }
    setLoading(false)
  }, [he])

  useEffect(() => {
    const admin = getSession()?.role === 'admin'
    setIsAdmin(admin)
    if (admin) load()
  }, [load])

  const setRead = async (id: string, is_read: boolean) => {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, is_read } : x)))
    const { error: err } = await db().from('contact_messages').update({ is_read }).eq('id', id)
    if (err) load()
  }

  const remove = async (id: string) => {
    if (!window.confirm(he ? 'למחוק את ההודעה לצמיתות?' : 'Delete this message permanently?')) return
    setMsgs((m) => m.filter((x) => x.id !== id))
    const { error: err } = await db().from('contact_messages').delete().eq('id', id)
    if (err) load()
  }

  const toggleOpen = (m: Message) => {
    const next = open === m.id ? null : m.id
    setOpen(next)
    if (next && !m.is_read) setRead(m.id, true)
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'לתיבת הפניות יש גישה למנהל המערכת בלבד' : 'The inbox is for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">
            {he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}
          </Link>
        </div>
      </div>
    )
  }

  const unreadCount = msgs.filter((m) => !m.is_read).length
  const shown = filter === 'unread' ? msgs.filter((m) => !m.is_read) : msgs
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(he ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })
  const waNumber = (phone: string) => {
    const d = phone.replace(/\D/g, '')
    return d.startsWith('972') ? d : d.startsWith('0') ? `972${d.slice(1)}` : d
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href={`/${locale}/matchmaker`} className="text-xs text-navy-400 hover:text-navy-600">
              {he ? '← לוח הבקרה' : '← Dashboard'}
            </Link>
            <h1 className="text-xl font-bold text-navy-700 mt-1">{he ? 'תיבת פניות מהאתר' : 'Website inbox'}</h1>
            <p className="text-sm text-gray-500">
              {he ? `${unreadCount} לא נקראו מתוך ${msgs.length}` : `${unreadCount} unread of ${msgs.length}`}
            </p>
          </div>
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-10 px-5 rounded-full text-sm font-medium transition-colors ${
                  filter === f ? 'bg-navy-800 text-white' : 'bg-[#f1f1f1] text-navy-700 hover:bg-navy-50'
                }`}
              >
                {f === 'all' ? (he ? 'הכל' : 'All') : he ? 'לא נקראו' : 'Unread'}
              </button>
            ))}
            <button onClick={load} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
              {he ? 'רענון' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-3">
        {loading && <p className="text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="text-center text-gray-400 py-16">
            {filter === 'unread' ? (he ? 'אין הודעות שלא נקראו' : 'No unread messages') : he ? 'עדיין לא התקבלו פניות' : 'No messages yet'}
          </p>
        )}

        {shown.map((m) => (
          <article key={m.id} className={`rounded-[24px] bg-white shadow-card overflow-hidden ${m.is_read ? '' : 'ring-2 ring-burgundy-300'}`}>
            <button onClick={() => toggleOpen(m)} className="w-full text-start px-6 py-4 flex items-center gap-3">
              {!m.is_read && <span className="w-2.5 h-2.5 rounded-full bg-burgundy-400 shrink-0" aria-label={he ? 'לא נקרא' : 'Unread'} />}
              <div className="flex-1 min-w-0">
                <p className={`truncate ${m.is_read ? 'text-navy-600' : 'font-bold text-navy-800'}`}>{m.subject}</p>
                <p className="text-xs text-navy-400 truncate">{m.name} · {m.phone}</p>
              </div>
              <span className="text-xs text-navy-400 shrink-0">{fmt(m.created_at)}</span>
            </button>

            {open === m.id && (
              <div className="px-6 pb-5 border-t border-navy-50 pt-4 flex flex-col gap-4">
                <p className="whitespace-pre-wrap break-words text-navy-700 text-sm leading-relaxed">{m.message}</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`} className="h-10 px-5 rounded-full bg-navy-800 text-white text-sm font-semibold inline-flex items-center hover:bg-navy-700">
                    {he ? 'התקשרות' : 'Call'}
                  </a>
                  <a href={`https://wa.me/${waNumber(m.phone)}`} target="_blank" rel="noopener noreferrer" className="h-10 px-5 rounded-full bg-burgundy-500 text-white text-sm font-semibold inline-flex items-center hover:bg-burgundy-600">
                    WhatsApp
                  </a>
                  <button onClick={() => setRead(m.id, !m.is_read)} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
                    {m.is_read ? (he ? 'סמן כלא נקרא' : 'Mark unread') : he ? 'סמן כנקרא' : 'Mark read'}
                  </button>
                  <button onClick={() => remove(m.id)} className="h-10 px-5 rounded-full text-sm text-burgundy-500 hover:bg-burgundy-50 ms-auto">
                    {he ? 'מחיקה' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  )
}
