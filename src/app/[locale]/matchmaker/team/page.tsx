'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

interface Member {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  is_admin: boolean
}

/** Administrator view of the matchmaker team: who can sign in and who is an admin. */
export default function TeamPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [me, setMe] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await createClient()
      .from('matchmakers')
      .select('id,email,first_name,last_name,phone,is_admin')
      .order('is_admin', { ascending: false })
    if (err) {
      setError(he ? 'לא ניתן לטעון את הצוות.' : 'Could not load the team.')
    } else {
      setMembers((data ?? []) as Member[])
    }
    setLoading(false)
  }, [he])

  useEffect(() => {
    const s = getSession()
    setIsAdmin(s?.role === 'admin')
    setMe(s?.email ?? '')
    if (s?.role === 'admin') load()
  }, [load])

  const setAdmin = async (m: Member, value: boolean) => {
    const verb = value ? (he ? 'להפוך למנהל' : 'make an admin') : he ? 'להסיר הרשאת מנהל מ' : 'remove admin rights from'
    if (!window.confirm(`${verb} ${m.first_name} ${m.last_name} (${m.email})?`)) return
    setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, is_admin: value } : x)))
    const { error: err } = await createClient().from('matchmakers').update({ is_admin: value }).eq('id', m.id)
    if (err) {
      setError(he ? 'העדכון נכשל.' : 'Update failed.')
      load()
    }
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'ניהול הצוות למנהל המערכת בלבד' : 'Team management is for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">{he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link href={`/${locale}/matchmaker`} className="text-xs text-navy-400 hover:text-navy-600">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
          <h1 className="text-xl font-bold text-navy-700 mt-1">{he ? 'צוות השדכנים' : 'Matchmaker team'}</h1>
          <p className="text-sm text-gray-500">
            {he
              ? 'כאן מנהלים מי מנהל. כדי להוסיף שדכן חדש יוצרים לו משתמש ב-Supabase (Authentication) ואז רשומת שדכן עם אותו מייל.'
              : 'Manage who is an admin here. To add a new matchmaker, create their user in Supabase (Authentication) and then a matchmaker row with the same email.'}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-3">
        {loading && <p className="text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {members.map((m) => {
          const self = m.email === me
          return (
            <article key={m.id} className="rounded-[24px] bg-white shadow-card px-6 py-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-800 truncate">
                  {m.first_name} {m.last_name}
                  {m.is_admin && <span className="ms-2 text-[10px] bg-navy-800 text-white px-2 py-0.5 rounded-full align-middle">{he ? 'מנהל' : 'Admin'}</span>}
                </p>
                <p className="text-xs text-navy-400 truncate">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
              </div>
              {self ? (
                <span className="text-xs text-navy-400">{he ? 'זה אתה' : 'You'}</span>
              ) : (
                <button onClick={() => setAdmin(m, !m.is_admin)}
                  className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
                  {m.is_admin ? (he ? 'הסר הרשאת מנהל' : 'Remove admin') : he ? 'הפוך למנהל' : 'Make admin'}
                </button>
              )}
            </article>
          )
        })}
      </main>
    </div>
  )
}
