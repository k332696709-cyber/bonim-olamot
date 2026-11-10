'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'
import { useConfirm } from '@/components/ui/useConfirm'
import { specialtyLabel } from '@/constants/matchmakerForm'

interface Application {
  id: string
  created_at: string
  user_id: string
  email: string
  gender: 'male' | 'female' | null
  first_name: string
  last_name: string
  phone: string
  birth_date: string | null
  photo_path: string | null
  biography: string | null
  years_experience: number | null
  matches_closed: number | null
  city: string | null
  specialties: string[]
  languages: string | null
  status: 'pending' | 'approved' | 'rejected'
}

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
  const { confirm, dialog } = useConfirm(he)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [me, setMe] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [photos, setPhotos] = useState<Record<string, string>>({})
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
    // Pending join requests (table created by migration 007; ignore if it is not there yet).
    const { data: pending } = await (createClient() as any)
      .from('matchmaker_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    const list = (pending ?? []) as Application[]
    setApps(list)
    const urls: Record<string, string> = {}
    for (const a of list) {
      if (!a.photo_path) continue
      const { data: signed } = await createClient().storage.from('registration-photos').createSignedUrl(a.photo_path, 3600)
      if (signed?.signedUrl) urls[a.id] = signed.signedUrl
    }
    setPhotos(urls)
    setLoading(false)
  }, [he])

  useEffect(() => {
    restoreSession().then((s) => {
      setIsAdmin(s?.role === 'admin')
      setMe(s?.email ?? '')
      if (s?.role === 'admin') load()
    })
  }, [load])

  const removeMember = async (m: Member) => {
    const ask = he
      ? `למחוק את ${m.first_name} ${m.last_name} (${m.email}) מהצוות? הגישה שלו/ה למערכת תוסר, וההתחברות תימחק. אי אפשר לשחזר.`
      : `Remove ${m.first_name} ${m.last_name} (${m.email}) from the team? Their access is removed and their login deleted. This cannot be undone.`
    if (!(await confirm(ask, { danger: true, confirmLabel: he ? 'מחיקה' : 'Remove' }))) return
    setError('')
    const { data: sess } = await createClient().auth.getSession()
    const res = await fetch('/api/admin/matchmaker', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token ?? ''}` },
      body: JSON.stringify({ matchmakerId: m.id }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json?.message ?? (he ? 'המחיקה נכשלה.' : 'Delete failed.'))
      return
    }
    setMembers((list) => list.filter((x) => x.id !== m.id))
  }

  const setAdmin = async (m: Member, value: boolean) => {
    const verb = value ? (he ? 'להפוך למנהל' : 'make an admin') : he ? 'להסיר הרשאת מנהל מ' : 'remove admin rights from'
    if (!(await confirm(`${verb} ${m.first_name} ${m.last_name} (${m.email})?`))) return
    setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, is_admin: value } : x)))
    const { error: err } = await createClient().from('matchmakers').update({ is_admin: value }).eq('id', m.id)
    if (err) {
      setError(he ? 'העדכון נכשל.' : 'Update failed.')
      load()
    }
  }

  const review = async (a: Application, approve: boolean) => {
    const name = `${a.first_name} ${a.last_name}`
    const q = approve
      ? (he ? `לאשר את ${name} כשדכן/ית? הם יוכלו להיכנס למערכת.` : `Approve ${name} as a matchmaker? They will be able to sign in.`)
      : (he ? `לדחות את הבקשה של ${name}?` : `Reject ${name}'s request?`)
    if (!(await confirm(q, { danger: !approve, confirmLabel: approve ? (he ? 'אישור' : 'Approve') : he ? 'דחייה' : 'Reject' }))) return
    setError('')
    const db = createClient() as any
    if (approve) {
      const { error: insErr } = await db.from('matchmakers').insert({
        user_id: a.user_id, email: a.email, first_name: a.first_name, last_name: a.last_name,
        phone: a.phone, is_admin: false,
      })
      if (insErr) {
        setError(he ? 'האישור נכשל. ייתכן שכבר קיים שדכן עם המייל הזה.' : 'Approval failed. A matchmaker with this email may already exist.')
        return
      }
    }
    const { error: updErr } = await db
      .from('matchmaker_applications')
      .update({ status: approve ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', a.id)
    if (updErr) setError(he ? 'עדכון הסטטוס נכשל.' : 'Updating the status failed.')
    load()
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
      {dialog}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <Link href={`/${locale}/matchmaker`} className="text-xs text-navy-400 hover:text-navy-600">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
          <h1 className="text-xl font-bold text-navy-700 mt-1">{he ? 'צוות השדכנים' : 'Matchmaker team'}</h1>
          <p className="text-sm text-gray-500">
            {he
              ? 'שדכנים חדשים נרשמים באתר, והבקשה מגיעה לכאן. לוחצים אישור והם נכנסים למערכת.'
              : 'New matchmakers register on the site and their request shows up here. Approve it and they can sign in.'}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-3">
        {loading && <p className="text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {apps.length > 0 && (
          <section className="rounded-[28px] bg-white shadow-card ring-2 ring-burgundy-300 p-5 flex flex-col gap-3 mb-3">
            <h2 className="font-bold text-navy-800">
              {he ? `בקשות הצטרפות (${apps.length})` : `Join requests (${apps.length})`}
            </h2>
            {apps.map((a) => (
              <article key={a.id} className="rounded-2xl bg-[#f1f1f1] px-5 py-4 flex gap-4 flex-wrap">
                {photos[a.id] && (
                  // Signed URL from private storage, so next/image is not used.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[a.id]} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-white" />
                )}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-navy-800">
                    {a.first_name} {a.last_name}
                    {a.gender && <span className="ms-2 text-[11px] bg-navy-800 text-white px-2 py-0.5 rounded-full align-middle">{a.gender === 'female' ? (he ? 'שדכנית' : 'Female') : he ? 'שדכן' : 'Male'}</span>}
                  </p>
                  <p className="text-xs text-navy-500" dir="ltr" style={{ textAlign: he ? 'right' : 'left' }}>{a.email} · {a.phone}</p>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {[
                      a.city,
                      a.birth_date && (he ? `נולד/ה ${new Date(a.birth_date).toLocaleDateString('he-IL')}` : `Born ${new Date(a.birth_date).toLocaleDateString('en-GB')}`),
                      a.years_experience != null && (he ? `${a.years_experience} שנות ניסיון` : `${a.years_experience} yrs experience`),
                      a.matches_closed != null && (he ? `${a.matches_closed} שידוכים נסגרו` : `${a.matches_closed} matches closed`),
                    ].filter(Boolean).join(' · ')}
                  </p>
                  {a.specialties?.length > 0 && (
                    <p className="text-xs text-navy-600 mt-1">{a.specialties.map((s) => specialtyLabel(s, he)).join(', ')}</p>
                  )}
                  {a.languages && <p className="text-xs text-navy-500">{he ? 'שפות: ' : 'Languages: '}{a.languages}</p>}
                  {a.biography && <p className="text-sm text-navy-700 mt-2 whitespace-pre-wrap break-words">{a.biography}</p>}
                </div>
                <div className="flex gap-2 items-start">
                  <button onClick={() => review(a, true)} className="h-10 px-5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-semibold">
                    {he ? 'אישור' : 'Approve'}
                  </button>
                  <button onClick={() => review(a, false)} className="h-10 px-5 rounded-full border border-navy-200 text-navy-700 hover:bg-white text-sm">
                    {he ? 'דחייה' : 'Reject'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
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
<>
                  <button onClick={() => setAdmin(m, !m.is_admin)}
                    className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
                    {m.is_admin ? (he ? 'הסר הרשאת מנהל' : 'Remove admin') : he ? 'הפוך למנהל' : 'Make admin'}
                  </button>
                  {!m.is_admin && (
                    <button onClick={() => removeMember(m)}
                      className="h-10 px-5 rounded-full text-sm text-burgundy-500 hover:bg-burgundy-50">
                      {he ? 'מחיקה' : 'Remove'}
                    </button>
                  )}
                </>
              )}
            </article>
          )
        })}
      </main>
    </div>
  )
}
