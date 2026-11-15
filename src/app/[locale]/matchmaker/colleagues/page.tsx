'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { specialtyLabel } from '@/constants/matchmakerForm'

interface Member {
  id: string
  isMe: boolean
  name: string
  email: string
  phone: string
  city: string
  biography: string
  specialties: string[]
  languages: string
  yearsExperience: number | null
}

/**
 * The matchmakers' directory. Every matchmaker can see who else works on the site and what they
 * handle, so they can cooperate on a match. It deliberately shows no activity or statistics:
 * each matchmaker sees only their own numbers.
 */
export default function ColleaguesPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch('/api/matchmaker/team', { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        const json = await res.json().catch(() => ({}))
        if (!alive) return
        if (!res.ok) { setError(json?.message ?? (he ? 'לא ניתן לטעון את הצוות.' : 'Could not load the team.')); return }
        setMembers(json.members ?? [])
      } catch {
        if (alive) setError(he ? 'לא ניתן לטעון את הצוות.' : 'Could not load the team.')
      }
    })()
    return () => { alive = false }
  }, [he])

  const shown = (members ?? []).filter((m) => {
    const t = q.trim().toLowerCase()
    if (!t) return true
    return [m.name, m.city, m.languages, ...m.specialties.map((s) => specialtyLabel(s, he))].join(' ').toLowerCase().includes(t)
  })

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="hero-dark text-white px-4 py-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">{he ? 'צוות השדכנים' : 'The matchmakers'}</h1>
        <p className="text-navy-100 max-w-2xl mx-auto">
          {he
            ? 'מי עוד פועל באתר ובמה הוא מתמחה, כדי שאפשר יהיה לשתף פעולה. אפשר להוסיף שדכן/ית נוסף/ת לשידוך מתוך מעקב השידוכים.'
            : 'Who else works on the site and what they handle, so you can cooperate. You can add another matchmaker to a match from the match tracker.'}
        </p>
        <p className="text-navy-300 text-xs mt-3">
          {he ? 'הנתונים והסטטיסטיקות של כל שדכן/ית אינם מוצגים לאחרים.' : 'Each matchmaker’s activity and statistics are not shown to others.'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={he ? 'חיפוש לפי שם, עיר, התמחות או שפה' : 'Search by name, city, specialty or language'}
            className="h-11 w-full sm:w-96 rounded-full bg-white shadow-card px-5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-600 underline">{he ? '← חזרה ללוח' : '← Back to the hub'}</Link>
        </div>

        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {!error && members === null && <p className="text-center text-navy-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {members && shown.length === 0 && <p className="text-center text-navy-400 py-10">{he ? 'לא נמצאו שדכנים.' : 'No matchmakers found.'}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shown.map((m) => (
            <article key={m.id} className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <span className="w-14 h-14 shrink-0 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-light">
                  {m.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-navy-800">
                    {m.name}
                    {m.isMe && <span className="ms-2 text-[10px] bg-burgundy-500 text-white px-2 py-0.5 rounded-full align-middle">{he ? 'אני' : 'Me'}</span>}
                  </h2>
                  <p className="text-sm text-navy-500">
                    {[m.city, m.yearsExperience != null ? (he ? `${m.yearsExperience} שנות ניסיון` : `${m.yearsExperience} years' experience`) : ''].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              {m.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-navy-50 text-navy-600 text-xs px-3 py-1">{specialtyLabel(s, he)}</span>
                  ))}
                </div>
              )}
              {m.languages && <p className="text-sm text-navy-600"><span className="text-navy-400">{he ? 'שפות: ' : 'Languages: '}</span>{m.languages}</p>}
              {m.biography && <p className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap break-words">{m.biography}</p>}

              {!m.isMe && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {m.phone && (
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, '')}`} className="h-10 px-5 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold inline-flex items-center" dir="ltr">
                      {m.phone}
                    </a>
                  )}
                  <a href={`mailto:${m.email}`} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50 inline-flex items-center">
                    {he ? 'מייל' : 'Email'}
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
