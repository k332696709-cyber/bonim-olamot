'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MAX_PHOTO_BYTES } from '@/constants/registrationForms'
import type { CandidatePhoto } from '@/lib/auth/candidate'

const SLOTS = [0, 1, 2, 3, 4]

const STATUS = {
  pending: { he: 'ממתינה לאישור', en: 'Waiting for approval', cls: 'bg-orange-500 text-white' },
  approved: { he: 'אושרה', en: 'Approved', cls: 'bg-green-600 text-white' },
  rejected: { he: 'לא אושרה, אפשר להחליף', en: 'Not approved, you can replace it', cls: 'bg-burgundy-500 text-white' },
} as const

/**
 * Five photo boxes. Each photo has its own status, because the administrator approves them one
 * by one. Click a box to add or replace a photo; the first box is the main photo.
 */
export function PhotoSlots({ photos, he, onChanged }: { photos: CandidatePhoto[]; he: boolean; onChanged: () => void | Promise<void> }) {
  const [busy, setBusy] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const bySlot = (slot: number) => photos.find((p) => p.slot === slot)

  const call = async (init: RequestInit) => {
    const { data } = await createClient().auth.getSession()
    const res = await fetch('/api/candidate/photo', {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json?.message ?? (he ? 'הפעולה נכשלה.' : 'The action failed.'))
  }

  const upload = async (slot: number, file: File | null) => {
    if (!file) return
    setMsg('')
    if (!file.type.startsWith('image/')) return setMsg(he ? 'יש לבחור קובץ תמונה.' : 'Please choose an image file.')
    if (file.size > MAX_PHOTO_BYTES) return setMsg(he ? 'הקובץ גדול מדי (עד 10 מגה-בייט).' : 'File too large (max 10 MB).')
    setBusy(slot)
    try {
      const fd = new FormData()
      fd.append('slot', String(slot))
      fd.append('photo', file)
      await call({ method: 'POST', body: fd })
      setMsg(he ? 'התמונה הועלתה וממתינה לאישור.' : 'Photo uploaded and waiting for approval.')
      await onChanged()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : he ? 'ההעלאה נכשלה. בדקו את החיבור.' : 'Upload failed. Check your connection.')
    } finally {
      setBusy(null)
      const el = inputs.current[slot]
      if (el) el.value = ''
    }
  }

  const makeMain = async (slot: number) => {
    setMsg('')
    setBusy(slot)
    try {
      await call({ method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot }) })
      await onChanged()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : he ? 'העדכון נכשל.' : 'The update failed.')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (slot: number) => {
    setMsg('')
    setBusy(slot)
    try {
      await call({ method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot }) })
      await onChanged()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : he ? 'ההסרה נכשלה.' : 'Removal failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-bold text-navy-800">{he ? 'התמונות שלי' : 'My photos'}</h3>
        <span className="text-xs text-navy-400">{he ? `${photos.length} מתוך 5` : `${photos.length} of 5`}</span>
      </div>
      <p className="text-xs text-navy-400 mb-3">
        {he
          ? 'כל תמונה נבדקת בנפרד. עד שתאושר, רק את/ה רואה אותה. אפשר לבחור איזו תמונה תהיה הראשית.'
          : 'Each photo is reviewed separately. Until approved, only you can see it. You choose which photo is the main one.'}
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {SLOTS.map((slot) => {
          const photo = bySlot(slot)
          const loading = busy === slot
          return (
            <div key={slot} className="flex flex-col gap-1.5">
              <input
                ref={(el) => { inputs.current[slot] = el }}
                type="file" accept="image/*" className="sr-only" tabIndex={-1}
                onChange={(e) => upload(slot, e.target.files?.[0] ?? null)}
              />
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f1f1f1] ring-1 ring-navy-100">
                {photo ? (
                  <>
                    {/* Signed URL from private storage, so next/image is not used. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {photo.url && <img src={photo.url} alt="" className="w-full h-full object-cover" />}
                    {photo.main && (
                      <span className="absolute bottom-1 start-1 text-[10px] font-bold bg-navy-800 text-white rounded-full px-2 py-0.5">{he ? 'ראשית' : 'Main'}</span>
                    )}
                    <button
                      type="button" onClick={() => remove(slot)} disabled={loading || photos.length <= 1}
                      aria-label={he ? 'הסרת תמונה' : 'Remove photo'}
                      title={photos.length <= 1 ? (he ? 'חובה להשאיר לפחות תמונה אחת' : 'At least one photo must stay') : undefined}
                      className="absolute top-1 end-1 w-6 h-6 rounded-full bg-white/90 text-navy-800 text-sm font-bold shadow flex items-center justify-center disabled:opacity-40"
                    >
                      {'×'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button" onClick={() => inputs.current[slot]?.click()} disabled={loading}
                    className="w-full h-full flex flex-col items-center justify-center gap-1 border-2 border-dashed border-navy-200 hover:border-navy-400 text-navy-400 hover:text-navy-600 rounded-2xl transition-colors"
                  >
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-[11px]">{loading ? (he ? 'מעלה...' : 'Uploading…') : he ? 'הוספה' : 'Add'}</span>
                  </button>
                )}
                {loading && photo && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-navy-600">{he ? 'מעדכן...' : 'Updating…'}</div>
                )}
              </div>
              {photo && (
                <>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-1 text-center leading-tight ${STATUS[photo.status].cls}`}>
                    {he ? STATUS[photo.status].he : STATUS[photo.status].en}
                  </span>
                  <div className="flex flex-col items-center gap-0.5">
                    {!photo.main && (
                      <button type="button" onClick={() => makeMain(slot)} disabled={loading} className="text-[11px] text-burgundy-600 font-semibold underline">
                        {he ? 'הגדרה כראשית' : 'Make main'}
                      </button>
                    )}
                    <button type="button" onClick={() => inputs.current[slot]?.click()} disabled={loading} className="text-[11px] text-navy-500 underline">
                      {he ? 'החלפה' : 'Replace'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
      {msg && <p className="text-xs text-navy-600 mt-3" role="status">{msg}</p>}
    </div>
  )
}
