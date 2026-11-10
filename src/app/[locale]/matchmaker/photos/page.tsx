'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

interface Item {
  key: string
  id: string
  gender: 'male' | 'female'
  name: string
  meta: string
  photoPath: string
  url: string
}

/** Administrator review queue: approve or reject each candidate's photo. */
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
    const out: Item[] = []
    for (const g of ['male', 'female'] as const) {
      const { data, error: err } = await db
        .from(`${g}_registrations`)
        .select('id, answers, photo_path, created_at')
        .eq('photo_status', 'pending')
        .order('created_at', { ascending: true })
      if (err) {
        setError(he ? 'לא ניתן לטעון. ודאו שהרצתם את קובץ ה-SQL של בדיקת התמונות.' : 'Could not load. Make sure the photo-review SQL has been run.')
        continue
      }
      for (const r of data ?? []) {
        const { data: signed } = await createClient().storage.from('registration-photos').createSignedUrl(r.photo_path, 3600)
        out.push({
          key: `${g}-${r.id}`,
          id: r.id,
          gender: g,
          name: `${r.answers?.fullName ?? ''} ${r.answers?.lastName ?? ''}`.trim(),
          meta: [r.answers?.age, r.answers?.city].filter(Boolean).join(' · '),
          photoPath: r.photo_path,
          url: signed?.signedUrl ?? '',
        })
      }
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
    setBusy(it.key)
    setError('')
    const { error: err } = await (createClient() as any)
      .from(`${it.gender}_registrations`)
      .update({ photo_status: approve ? 'approved' : 'rejected', photo_reviewed_at: new Date().toISOString() })
      .eq('id', it.id)
    setBusy(null)
    if (err) {
      setError(he ? 'העדכון נכשל.' : 'Update failed.')
      return
    }
    setItems((list) => list.filter((x) => x.key !== it.key))
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'אישור תמונות למנהל המערכת בלבד' : 'Photo review is for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">{he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href={`/${locale}/matchmaker`} className="text-xs text-navy-400 hover:text-navy-600">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
            <h1 className="text-xl font-bold text-navy-700 mt-1">{he ? 'תמונות לאישור' : 'Photos to review'}</h1>
            <p className="text-sm text-gray-500">
              {he
                ? 'בדקו שהתמונה ברורה ומתאימה. עד האישור רק המועמד/ת רואה אותה.'
                : 'Check the photo is clear and suitable. Until approved only the candidate sees it.'}
            </p>
          </div>
          <button onClick={load} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
            {he ? 'רענון' : 'Refresh'} ({items.length})
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {loading && <p className="sm:col-span-2 text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {error && <p className="sm:col-span-2 rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="sm:col-span-2 text-center text-gray-400 py-16">{he ? 'אין תמונות שממתינות לאישור 🎉' : 'No photos waiting 🎉'}</p>
        )}

        {items.map((it) => (
          <article key={it.key} className="rounded-[28px] bg-white shadow-card overflow-hidden flex flex-col">
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
                </p>
                {it.meta && <p className="text-xs text-navy-400">{it.meta}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => review(it, true)} disabled={busy === it.key}
                  className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold"
                >
                  ✓ {he ? 'אישור' : 'Approve'}
                </button>
                <button
                  onClick={() => review(it, false)} disabled={busy === it.key}
                  className="h-12 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 disabled:opacity-60 text-sm font-semibold"
                >
                  ✗ {he ? 'דחייה' : 'Reject'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
