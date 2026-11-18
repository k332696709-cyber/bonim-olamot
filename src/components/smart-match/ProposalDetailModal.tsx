'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PhotoViewer } from '@/components/ui/PhotoViewer'

interface Detail {
  name: string
  mutual: boolean
  photos: string[]
  photosHidden: boolean
  resume: { label: string; value: string }[]
  references: { name: string; relation: string; phone: string }[] | null
}

/**
 * The full card of a proposal: name, all photos (unless their owner keeps them private until
 * mutual interest), the resume, and, after mutual interest, the names and phones to ask about.
 * Phone and email of the person never appear here.
 */
export function ProposalDetailModal({ id, he, onClose }: { id: string; he: boolean; onClose: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState(false)
  const [viewAt, setViewAt] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch(`/api/candidate/proposals/${id}`, { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        if (!res.ok) throw new Error('bad')
        const json = await res.json()
        if (alive) setDetail(json.detail)
      } catch {
        if (alive) setError(true)
      }
    })()
    return () => { alive = false }
  }, [id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && viewAt === null) onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, viewAt])

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose} dir={he ? 'rtl' : 'ltr'}>
      <div
        role="dialog" aria-modal="true"
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-luxury"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-navy-50">
          <h3 className="text-xl font-bold text-navy-800">{detail?.name || (he ? 'הכרטיס המלא' : 'Full card')}</h3>
          <button type="button" onClick={onClose} aria-label={he ? 'סגירה' : 'Close'} className="w-10 h-10 rounded-full bg-[#f1f1f1] text-navy-800 text-xl font-bold">×</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {!detail && !error && <p className="text-center text-navy-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
          {error && <p className="text-center text-navy-500 py-10">{he ? 'לא הצלחנו לטעון את הכרטיס. נסו שוב.' : 'Could not load the card. Try again.'}</p>}

          {detail && (
            <>
              <section>
                {detail.photosHidden ? (
                  <p className="rounded-2xl bg-[#f1f1f1] text-navy-600 text-sm px-4 py-3">
                    {he ? 'התמונות יוצגו לאחר עניין הדדי, לפי בחירת הצד השני.' : 'The photos will be shown after mutual interest, at the other side’s choice.'}
                  </p>
                ) : detail.photos.length === 0 ? (
                  <p className="rounded-2xl bg-[#f1f1f1] text-navy-600 text-sm px-4 py-3">{he ? 'עדיין אין תמונות מאושרות.' : 'No approved photos yet.'}</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {detail.photos.map((u, i) => (
                      <button key={u} type="button" onClick={() => setViewAt(i)} aria-label={he ? 'הגדלת התמונה' : 'View photo'} className="cursor-zoom-in">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover bg-[#f1f1f1]" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {detail.resume.length > 0 && (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {detail.resume.map((r, i) => (
                    <div key={`${r.label}-${i}`} className={r.value.length > 70 ? 'sm:col-span-2' : ''}>
                      <dt className="text-xs font-semibold text-navy-400">{r.label}</dt>
                      <dd className="text-navy-800 break-words whitespace-pre-wrap">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {detail.references ? (
                <section className="rounded-2xl bg-navy-50 px-5 py-4">
                  <h4 className="font-bold text-navy-800 mb-2">{he ? 'מספרים לבירורים' : 'People to ask about them'}</h4>
                  {detail.references.length === 0 ? (
                    <p className="text-sm text-navy-500">{he ? 'לא נמסרו מספרים לבירורים.' : 'No inquiry contacts were given.'}</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5 text-sm text-navy-800">
                      {detail.references.map((r, i) => (
                        <li key={i}>
                          {r.name}{r.relation ? ` (${r.relation})` : ''}{' '}
                          {r.phone && <a href={`tel:${r.phone}`} dir="ltr" className="font-semibold text-burgundy-600">{r.phone}</a>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : (
                <p className="text-xs text-navy-400">
                  {he ? 'מספרים לבירורים יוצגו לאחר עניין הדדי.' : 'Inquiry contacts are shown after mutual interest.'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {viewAt !== null && detail && <PhotoViewer photos={detail.photos} start={viewAt} onClose={() => setViewAt(null)} />}
    </div>
  )
}
