'use client'

import { useRef, useState } from 'react'
import {
  allFields, MAX_PHOTO_BYTES, validateField,
  type RegistrationForm, type TallyField,
} from '@/constants/registrationForms'

/**
 * Registration form rendered from a Tally-copy config
 * (see constants/registrationForms.ts). Always Hebrew / RTL, like the original.
 */
export function TallyRegistrationForm({ form, endpoint }: { form: RegistrationForm; endpoint: string }) {
  const [page, setPage] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [photo, setPhoto] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const pages = form.pages
  const last = page === pages.length - 1

  const setVal = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }))
    if (errors[id]) setErrors((e) => ({ ...e, [id]: '' }))
  }

  const validatePage = (index: number) => {
    const next: Record<string, string> = {}
    for (const f of pages[index].fields) {
      if (f.type === 'file') {
        if (f.required && !photo) next[f.id] = 'שדה חובה'
        continue
      }
      const err = validateField(f, values[f.id] ?? '')
      if (err) next[f.id] = err
    }
    setErrors((e) => ({ ...e, ...next }))
    return Object.keys(next).length === 0
  }

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const goNext = () => {
    if (!validatePage(page)) return
    setPage((p) => p + 1)
    setTimeout(scrollTop, 30)
  }
  const goBack = () => {
    setPage((p) => p - 1)
    setTimeout(scrollTop, 30)
  }

  const pickPhoto = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, photo: 'יש לבחור קובץ תמונה' }))
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((e) => ({ ...e, photo: 'הקובץ גדול מדי (עד 10 מגה-בייט)' }))
      return
    }
    setPhoto(file)
    setErrors((e) => ({ ...e, photo: '' }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!last) return goNext()
    for (let i = 0; i < pages.length; i++) {
      if (!validatePage(i)) {
        setPage(i)
        setTimeout(scrollTop, 30)
        return
      }
    }
    setSubmitting(true)
    setServerError('')
    try {
      const fd = new FormData()
      for (const f of allFields(form)) if (f.type !== 'file') fd.append(f.id, (values[f.id] ?? '').trim())
      if (photo) fd.append('photo', photo)
      const res = await fetch(endpoint, { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data?.fields) {
          setErrors(data.fields)
          const firstBad = pages.findIndex((p) => p.fields.some((f) => data.fields[f.id]))
          if (firstBad >= 0) setPage(firstBad)
        }
        setServerError(data?.message ?? 'השליחה נכשלה. נסו שוב בעוד רגע.')
        return
      }
      setDone(true)
      setTimeout(scrollTop, 30)
    } catch {
      setServerError('השליחה נכשלה. בדקו את החיבור ונסו שוב.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div ref={topRef} dir="rtl" className="rounded-[32px] bg-white shadow-card px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-3xl mb-5">✓</div>
        <h2 className="text-2xl font-bold text-navy-800 mb-2">תודה, השאלון נשלח!</h2>
        <p className="text-navy-500">נחזור אליך בהקדם.</p>
      </div>
    )
  }

  const inputBase =
    'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-navy-800 placeholder:text-navy-300 ' +
    'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-colors'

  const renderField = (f: TallyField) => {
    const err = errors[f.id]
    const border = err ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300'
    const id = `f-${f.id}`
    return (
      <div key={f.id} className="flex flex-col gap-6">
        {f.sectionBefore && (
          <h2 className="text-xl font-bold text-navy-800 border-b border-navy-50 pb-3 pt-2">{f.sectionBefore}</h2>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-[15px] font-semibold text-navy-800">
            {f.label}
            {f.required && <span className="text-burgundy-500 ms-1" aria-hidden>*</span>}
          </label>
          {f.hint && <p className="text-sm text-navy-400 -mt-0.5">{f.hint}</p>}

          {f.type === 'textarea' && (
            <textarea
              id={id} rows={2} value={values[f.id] ?? ''} onChange={(e) => setVal(f.id, e.target.value)}
              maxLength={2000} className={`${inputBase} ${border} resize-y min-h-[84px]`}
              aria-invalid={!!err} aria-required={f.required}
            />
          )}

          {f.type === 'select' && (
            <select
              id={id} value={values[f.id] ?? ''} onChange={(e) => setVal(f.id, e.target.value)}
              className={`${inputBase} ${border} appearance-none bg-no-repeat bg-[length:1rem] pe-4 ps-10
                bg-[position:left_1rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23336caf' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`}
              aria-invalid={!!err} aria-required={f.required}
            >
              <option value="">בחר...</option>
              {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {(f.type === 'text' || f.type === 'tel' || f.type === 'email') && (
            <input
              id={id}
              type={f.type}
              inputMode={f.numeric ? 'numeric' : f.type === 'tel' ? 'tel' : undefined}
              dir={f.type === 'tel' || f.type === 'email' ? 'ltr' : undefined}
              value={values[f.id] ?? ''} onChange={(e) => setVal(f.id, e.target.value)}
              maxLength={f.type === 'text' ? 200 : 100}
              className={`${inputBase} ${border} ${f.type === 'tel' || f.type === 'email' ? 'text-end' : ''}`}
              aria-invalid={!!err} aria-required={f.required}
              autoComplete={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'off'}
            />
          )}

          {f.type === 'file' && (
            <>
              <input
                ref={fileRef} id={id} type="file" accept="image/*" className="sr-only"
                onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pickPhoto(e.dataTransfer.files?.[0] ?? null) }}
                className={`rounded-2xl border-2 border-dashed ${err ? 'border-burgundy-400' : 'border-navy-200 hover:border-navy-400'}
                  bg-[#f7f8fa] px-4 py-8 text-center transition-colors`}
              >
                {photo ? (
                  <span className="block text-navy-800 font-medium">✓ {photo.name}</span>
                ) : (
                  <span className="block text-navy-600 font-medium">לחץ כדי לבחור קובץ או גרור לכאן</span>
                )}
                <span className="block text-sm text-navy-400 mt-1">מגבלת גודל: 10 מגה-בייט</span>
              </button>
              {photo && (
                <button type="button" onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="self-start text-sm text-navy-500 underline">
                  הסרת הקובץ
                </button>
              )}
            </>
          )}

          {err && <p className="text-sm text-burgundy-500" role="alert">{err}</p>}
        </div>
      </div>
    )
  }

  const progress = ((page + 1) / pages.length) * 100

  return (
    <form onSubmit={submit} noValidate dir="rtl" className="flex flex-col gap-6 pb-10">
      <div ref={topRef} className="scroll-mt-28" />

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 leading-snug">{form.title}</h1>
        <p className="text-sm text-navy-400 mt-2">שדות המסומנים ב-* הם חובה</p>
      </div>

      <div aria-label={`עמוד ${page + 1} מתוך ${pages.length}`}>
        <div className="h-2 rounded-full bg-white overflow-hidden shadow-inner">
          <div className="h-full rounded-full bg-burgundy-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-navy-400 mt-1.5 text-center">עמוד {page + 1} מתוך {pages.length}</p>
      </div>

      <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-9 flex flex-col gap-6">
        {pages[page].fields.map(renderField)}
      </div>

      {serverError && (
        <div className="rounded-2xl bg-burgundy-50 border border-burgundy-200 px-5 py-4 text-sm font-medium text-burgundy-600" role="alert">
          {serverError}
        </div>
      )}
      {Object.values(errors).some(Boolean) && !serverError && (
        <div className="rounded-2xl bg-burgundy-50 border border-burgundy-200 px-5 py-4 text-sm font-medium text-burgundy-600" role="alert">
          יש שדות שדורשים תיקון לפני שממשיכים.
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {page > 0 ? (
          <button type="button" onClick={goBack}
            className="h-12 px-7 rounded-full border border-navy-200 text-navy-700 hover:bg-white text-sm font-semibold transition-colors">
            הקודם
          </button>
        ) : <span />}
        <button type="submit" disabled={submitting}
          className="h-12 min-w-40 px-9 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold transition-colors">
          {last ? (submitting ? 'שולח...' : 'פרסם') : 'הבא'}
        </button>
      </div>
    </form>
  )
}
