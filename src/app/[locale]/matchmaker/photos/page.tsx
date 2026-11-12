'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

interface Item {
  id: string
  gender: 'male' | 'female'
  name: string
  meta: string
  slot: number
  main: boolean
  url: string
}

/** Administrator review queue: every photo is approved or rejected on its own. */
export default function PhotosPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const db = createClient() as any
    const { data: rows, error: err } = await db
      .from('candidate_photos')
      .select('id, user_id, gender, position, path, is_main, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (err) {
      setError(he ? 'לא ניתן לטעון את התמונות.' : 'Could not load the photos.')
      setLoading(false)
      return
    }
    // Names come from each candidate's registration.
    const people: Record<string, { name: string; meta: string }> = {}
    for (const g of ['male', 'female'] as const) {
      const ids = Array.from(new Set((rows ?? []).filter((r: any) => r.gender === g).map((r: any) => r.user_id)))
      if (ids.length === 0) continue
      const { data: regs } = await db.from(`${g}_registrations`).select('user_id, answers').in('user_id', ids)
      for (const r of regs ?? []) {
        people[r.user_id] = {
          name: `${r.answers?.fullName ?? ''} ${r.answers?.lastName ?? ''}`.trim(),
          meta: [r.answers?.age, r.answers?.city].filter(Boolean).join(' · '),
        }
      }
    }
    const out: Item[] = []
    for (const r of rows ?? []) {
      const { data: signed } = await createClient().storage.from('registration-photos').createSignedUrl(r.path, 3600)
      out.push({
        id: r.id,
        gender: r.gender,
        name: people[r.user_id]?.name ?? '',
        meta: people[r.user_id]?.meta ?? '',
        slot: r.position,
        main: !!r.is_main,
        url: signed?.signedUrl ?? '',
      })
    }
    setItems(out)
    setLoading(false)
  }, [he])

  useEffect(() => {
    restoreSession().then((s) => {
      const admin = s?.role === 'admin'
      setIsAdmin(admin)
      if (admin) load()
    })
  }, [load])

  const review = async (it: Item, approve: boolean) => {
    setBusy(it.id)
    setError('')
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/admin/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ id: it.id, approve }),
      })
      if (!res.ok) throw new Error('failed')
      setItems((list) => list.filter((x) => x.id !== it.id))
    } catch {
      setError(he ? 'העדכון נכשל.' : 'Update failed.')
    } finally {
      setBusy(null)
    }
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'אישור תמונות למנהל המערכת בלבד' : 'Photo review is for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">{he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <header className="hero-dark text-white pt-6 pb-4">
        <div className="max-w-4xl mx-auto px-6 py-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-100 hover:text-white">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3">{he ? 'תמונות לאישור' : 'Photos to review'}</h1>
            <p className="text-sm text-navy-100 mt-2">
              {he
                ? 'כל תמונה מאושרת או נדחית בנפרד. תמונה שאושרה מוצגת בפרופיל, ותמונה שנדחתה נשארת לפני המועמד/ת בלבד כדי שיחליפו אותה.'
                : 'Each photo is approved or rejected on its own. An approved photo appears on the profile; a rejected one stays with the candidate to replace.'}
            </p>
          </div>
          <button onClick={load} className="h-10 px-5 rounded-full border border-white/30 text-sm text-white hover:bg-white/10">
            {he ? 'רענון' : 'Refresh'} ({items.length})
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {loading && <p className="sm:col-span-2 text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {error && <p className="sm:col-span-2 rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="sm:col-span-2 text-center text-gray-400 py-16">{he ? 'אין תמונות שממתינות לאישור' : 'No photos waiting'}</p>
        )}

        {items.map((it) => (
          <article key={it.id} className="rounded-[28px] bg-white shadow-card overflow-hidden flex flex-col">
            <div className="bg-[#f1f1f1] flex items-center justify-center h-72">
              {it.url ? (
                // Signed URL from private storage, so next/image is not used.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.url} alt="" className="max-h-72 w-full object-contain" />
              ) : (
                <span className="text-sm text-navy-400">{he ? 'התמונה לא נטענה' : 'Photo failed to load'}</span>
              )}
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div>
                <p className="font-bold text-navy-800">
                  {it.name || '—'}
                  <span className="ms-2 text-[10px] bg-navy-800 text-white px-2 py-0.5 rounded-full align-middle">
                    {it.gender === 'male' ? (he ? 'מיועד' : 'Man') : he ? 'מיועדת' : 'Woman'}
                  </span>
                  <span className="ms-2 text-[10px] bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full align-middle">
                    {it.main ? (he ? 'התמונה הראשית' : 'Main photo') : he ? `תמונה ${it.slot + 1}` : `Photo ${it.slot + 1}`}
                  </span>
                </p>
                {it.meta && <p className="text-xs text-navy-400">{it.meta}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => review(it, true)} disabled={busy === it.id}
                  className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold"
                >
                  {'✓'} {he ? 'אישור' : 'Approve'}
                </button>
                <button
                  onClick={() => review(it, false)} disabled={busy === it.id}
                  className="h-12 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-60 text-sm font-semibold"
                >
                  {'✗'} {he ? 'דחייה' : 'Reject'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
