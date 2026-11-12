'use client'

import { useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  allFields, MAX_PHOTO_BYTES, MAX_PHOTOS, validateField, withOther, parseChoices, CHOICE_SEP, OTHER,
  type RegistrationForm, type TallyField,
} from '@/constants/registrationForms'

/**
 * Registration form rendered from a Tally-copy config
 * (see constants/registrationForms.ts). Always Hebrew / RTL, like the original.
 */
export function TallyRegistrationForm({
  form, endpoint, mode = 'create', initialValues, onSaved, onCancel,
}: {
  form: RegistrationForm
  endpoint: string
  /** "edit": a signed-in candidate updates their answers (no password, consent or photos here). */
  mode?: 'create' | 'edit'
  initialValues?: Record<string, string>
  onSaved?: () => void
  onCancel?: () => void
}) {
  const editing = mode === 'edit'
  const [page, setPage] = useState(0)
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {})
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [consent, setConsent] = useState(false)
  const [customDraft, setCustomDraft] = useState<Record<string, string>>({})
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const topRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const pages = useMemo(
    () => (editing ? form.pages.map((pg) => ({ fields: pg.fields.filter((f) => f.type !== 'file') })) : form.pages),
    [form, editing],
  )
  const last = page === pages.length - 1

  const setVal = (id: string, v: string) => {
    setValues((s) => ({ ...s, [id]: v }))
    if (errors[id]) setErrors((e) => ({ ...e, [id]: '' }))
  }

  const validatePage = (index: number) => {
    const next: Record<string, string> = {}
    for (const f of pages[index].fields) {
      if (f.type === 'file') {
        if (f.required && photos.length === 0) next[f.id] = 'שדה חובה'
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

  const addPhotos = (list: FileList | File[] | null) => {
    if (!list) return
    const incoming = Array.from(list)
    if (incoming.length === 0) return
    if (incoming.some((f) => !f.type.startsWith('image/'))) {
      setErrors((e) => ({ ...e, photo: 'יש לבחור קבצי תמונה' }))
      return
    }
    if (incoming.some((f) => f.size > MAX_PHOTO_BYTES)) {
      setErrors((e) => ({ ...e, photo: 'קובץ גדול מדי (עד 10 מגה-בייט לתמונה)' }))
      return
    }
    const merged = [...photos, ...incoming]
    if (merged.length > MAX_PHOTOS) {
      setErrors((e) => ({ ...e, photo: `אפשר להעלות עד ${MAX_PHOTOS} תמונות` }))
    } else {
      setErrors((e) => ({ ...e, photo: '' }))
    }
    const next = merged.slice(0, MAX_PHOTOS)
    setPhotos(next)
    setPreviews((old) => { old.forEach(URL.revokeObjectURL); return next.map((f) => URL.createObjectURL(f)) })
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (i: number) => {
    const next = photos.filter((_, idx) => idx !== i)
    setPhotos(next)
    setPreviews((old) => { old.forEach(URL.revokeObjectURL); return next.map((f) => URL.createObjectURL(f)) })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!last) return goNext()
    const acct: Record<string, string> = {}
    if (!editing) {
      if (password.length < 10) acct.password = 'הסיסמה חייבת להכיל לפחות 10 תווים'
      if (confirmPassword !== password) acct.confirmPassword = 'הסיסמאות אינן תואמות'
      if (!consent) acct.consent = 'יש לאשר את ההסכמה כדי להמשיך'
    }
    if (Object.keys(acct).length > 0) {
      setErrors((e) => ({ ...e, ...acct }))
      return
    }
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
      let headers: Record<string, string> | undefined
      if (editing) {
        const { data: sess } = await createClient().auth.getSession()
        headers = { Authorization: `Bearer ${sess.session?.access_token ?? ''}` }
      } else {
        for (const f of photos) fd.append('photo', f)
        fd.append('consent', '1')
        fd.append('password', password)
      }
      const res = await fetch(endpoint, { method: editing ? 'PUT' : 'POST', headers, body: fd })
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
      if (editing) {
        onSaved?.()
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
        <h2 className="text-2xl font-bold text-navy-800 mb-2">תודה, ההרשמה התקבלה!</h2>
        <p className="text-navy-500 max-w-md mx-auto">
          אפשר להיכנס עכשיו עם המייל והסיסמה שבחרת ולראות את הפרופיל שלך. התמונה תיבדק ותופיע למשתמשים אחרי שתאושר, ועד אז רק אתה רואה אותה.
        </p>
        <Link href="/he/login" className="inline-flex mt-6 h-12 items-center px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold">
          כניסה
        </Link>
      </div>
    )
  }

  const inputBase =
    'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-navy-800 placeholder:text-navy-300 ' +
    'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-colors'

  /** Chip selection: one choice, or several when the field is multi. "Other" opens a free-text box. */
  const toggleChoice = (f: TallyField, option: string) => {
    const current = parseChoices(values[f.id] ?? '')
    const isOther = (x: string) => x === OTHER || x.startsWith(OTHER + ': ')
    const has = option === OTHER ? current.some(isOther) : current.includes(option)
    let next: string[]
    if (f.multi) next = has ? current.filter((x) => (option === OTHER ? !isOther(x) : x !== option)) : [...current, option]
    else next = has ? [] : [option]
    if (f.max && next.length > f.max) return
    setVal(f.id, next.join(CHOICE_SEP))
  }
  const addCustom = (f: TallyField) => {
    const text = (customDraft[f.id] ?? '').replace(/\|/g, '/').trim().slice(0, 60)
    if (!text) return
    const current = parseChoices(values[f.id] ?? '')
    if (current.includes(text) || (f.max && current.length >= f.max)) return
    setVal(f.id, [...current, text].join(CHOICE_SEP))
    setCustomDraft((d) => ({ ...d, [f.id]: '' }))
  }
  const removeChoice = (f: TallyField, item: string) => {
    setVal(f.id, parseChoices(values[f.id] ?? '').filter((x) => x !== item).join(CHOICE_SEP))
  }
  const setOtherText = (f: TallyField, text: string) => {
    const clean = text.replace(/\|/g, '/')
    const current = parseChoices(values[f.id] ?? '').filter((x) => !(x === OTHER || x.startsWith(OTHER + ': ')))
    setVal(f.id, [...current, clean.trim() ? `${OTHER}: ${clean}` : OTHER].join(CHOICE_SEP))
  }

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
          <label id={`${id}-label`} htmlFor={f.type === 'select' ? undefined : id} className="text-[15px] font-semibold text-navy-800">
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

          {f.type === 'select' && (() => {
            const chosen = parseChoices(values[f.id] ?? '')
            const listed = f.custom ? f.options! : withOther(f.options!)
            const otherItem = f.custom ? undefined : chosen.find((x) => x === OTHER || x.startsWith(OTHER + ': '))
            const ownItems = f.custom ? chosen.filter((x) => !f.options!.includes(x)) : []
            const full = !!f.max && chosen.length >= f.max
            return (
              <div className="flex flex-col gap-3" role={f.multi ? 'group' : 'radiogroup'} aria-labelledby={`${id}-label`} id={id}>
                {f.multi && !f.custom && <p className="text-sm text-navy-400 -mt-0.5">אפשר לבחור יותר מאפשרות אחת</p>}
                {f.max && (
                  <p className={`text-xs font-semibold ${full ? 'text-burgundy-500' : 'text-navy-400'}`} aria-live="polite">
                    {chosen.length} מתוך {f.max}{full ? ' · אפשר להסיר כדי לבחור אחר' : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {listed.map((o) => {
                    const on = o === OTHER ? !!otherItem : chosen.includes(o)
                    const blocked = full && !on
                    return (
                      <button
                        key={o}
                        type="button"
                        role={f.multi ? 'checkbox' : 'radio'}
                        aria-checked={on}
                        aria-disabled={blocked}
                        onClick={() => { if (!blocked) toggleChoice(f, o) }}
                        className={`rounded-full border px-4 py-2.5 text-[15px] transition-colors ${
                          on
                            ? 'bg-navy-800 border-navy-800 text-white font-semibold'
                            : blocked ? 'bg-white border-navy-50 text-navy-300 cursor-not-allowed'
                            : err ? 'bg-white border-burgundy-400 text-navy-700 hover:border-navy-400' : 'bg-white border-navy-100 text-navy-700 hover:border-navy-300'
                        }`}
                      >
                        {on && f.multi && <span className="me-1.5" aria-hidden>{'\u2713'}</span>}
                        {o}
                      </button>
                    )
                  })}
                  {ownItems.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => removeChoice(f, o)}
                      aria-label={`הסרת ${o}`}
                      className="rounded-full border px-4 py-2.5 text-[15px] bg-burgundy-500 border-burgundy-500 text-white font-semibold"
                    >
                      {o} <span className="ms-1.5" aria-hidden>{'\u00d7'}</span>
                    </button>
                  ))}
                </div>
                {f.custom && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDraft[f.id] ?? ''}
                      onChange={(e) => setCustomDraft((d) => ({ ...d, [f.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(f) } }}
                      maxLength={60}
                      disabled={full}
                      placeholder={full ? 'הגעתם למקסימום' : 'הוסיפו משהו משלכם'}
                      className={`${inputBase} ${border} disabled:opacity-50`}
                      aria-label="הוספת בחירה משלכם"
                    />
                    <button
                      type="button"
                      onClick={() => addCustom(f)}
                      disabled={full || !(customDraft[f.id] ?? '').trim()}
                      className="shrink-0 rounded-2xl bg-navy-800 hover:bg-navy-700 disabled:opacity-40 text-white px-5 text-sm font-semibold"
                    >
                      הוספה
                    </button>
                  </div>
                )}
                {otherItem && (
                  <input
                    type="text"
                    value={otherItem.startsWith(OTHER + ': ') ? otherItem.slice(OTHER.length + 2) : ''}
                    onChange={(e) => setOtherText(f, e.target.value)}
                    maxLength={120}
                    placeholder="פרטו (לא חובה)"
                    className={`${inputBase} ${border}`}
                    aria-label="פירוט עבור אחר"
                  />
                )}
              </div>
            )
          })()}

          {(f.type === 'text' || f.type === 'tel' || f.type === 'email') && (
            <input
              id={id}
              type={f.type}
              inputMode={f.numeric ? 'numeric' : f.type === 'tel' ? 'tel' : undefined}
              dir={f.type === 'tel' || f.type === 'email' ? 'ltr' : undefined}
              value={values[f.id] ?? ''} onChange={(e) => setVal(f.id, e.target.value)}
              maxLength={f.type === 'text' ? 200 : 100}
              readOnly={editing && f.id === 'email'}
              className={`${inputBase} ${border} ${f.type === 'tel' || f.type === 'email' ? 'text-end' : ''} ${editing && f.id === 'email' ? 'bg-[#f1f1f1] text-navy-400' : ''}`}
              aria-invalid={!!err} aria-required={f.required}
              autoComplete={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'off'}
            />
          )}

          {f.type === 'file' && (
            <>
              <input
                ref={fileRef} id={id} type="file" accept="image/*" multiple className="sr-only"
                onChange={(e) => addPhotos(e.target.files)}
              />
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files) }}
                  className={`rounded-2xl border-2 border-dashed ${err ? 'border-burgundy-400' : 'border-navy-200 hover:border-navy-400'}
                    bg-[#f7f8fa] px-4 py-8 text-center transition-colors`}
                >
                  <span className="block text-navy-600 font-medium">
                    {photos.length === 0 ? 'לחץ כדי לבחור תמונות או גרור לכאן' : 'הוספת תמונה נוספת'}
                  </span>
                  <span className="block text-sm text-navy-400 mt-1">
                    {photos.length} מתוך {MAX_PHOTOS} · עד 10 מגה-בייט לתמונה
                  </span>
                </button>
              )}
              {photos.length > 0 && (
                <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-1">
                  {photos.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="relative aspect-square rounded-2xl overflow-hidden bg-[#f1f1f1] ring-1 ring-navy-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previews[i]} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 start-1 text-[10px] font-bold bg-navy-800 text-white rounded-full px-2 py-0.5">ראשית</span>
                      )}
                      <button
                        type="button" onClick={() => removePhoto(i)} aria-label="הסרת תמונה"
                        className="absolute top-1 end-1 w-6 h-6 rounded-full bg-white/90 text-navy-800 text-sm font-bold shadow flex items-center justify-center"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
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

      <p className="self-center rounded-full bg-white shadow-card px-4 py-1.5 text-xs text-navy-500">שדות המסומנים ב-* הם חובה</p>

      <div aria-label={`עמוד ${page + 1} מתוך ${pages.length}`}>
        <div className="h-2 rounded-full bg-white overflow-hidden shadow-inner">
          <div className="h-full rounded-full bg-burgundy-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-navy-400 mt-1.5 text-center">עמוד {page + 1} מתוך {pages.length}</p>
      </div>

      <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-9 flex flex-col gap-6">
        {pages[page].fields.map(renderField)}
      </div>

      {last && !editing && (
        <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-9 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-navy-800">סיסמה לכניסה</h2>
            <p className="text-sm text-navy-400">
              הכניסה היא עם המייל שמילאת בטופס והסיסמה שתבחר כאן. בעזרתם תראה את סטטוס ההרשמה, ואחרי האישור את הפרופיל שלך.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-password" className="text-[15px] font-semibold text-navy-800">סיסמה (לפחות 10 תווים)<span className="text-burgundy-500 ms-1" aria-hidden>*</span></label>
              <input
                id="f-password" type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((er) => ({ ...er, password: '' })) }}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-400 ${errors.password ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300'}`}
              />
              {errors.password && <p className="text-sm text-burgundy-500" role="alert">{errors.password}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="f-confirm" className="text-[15px] font-semibold text-navy-800">אימות סיסמה<span className="text-burgundy-500 ms-1" aria-hidden>*</span></label>
              <input
                id="f-confirm" type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((er) => ({ ...er, confirmPassword: '' })) }}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-400 ${errors.confirmPassword ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300'}`}
              />
              {errors.confirmPassword && <p className="text-sm text-burgundy-500" role="alert">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>
      )}

      {last && !editing && (
        <div className="rounded-2xl bg-white shadow-card px-5 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox" checked={consent} className="mt-1 w-5 h-5 accent-burgundy-500 shrink-0"
              onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setErrors((er) => ({ ...er, consent: '' })) }}
            />
            <span className="text-sm text-navy-700 leading-relaxed">
              קראתי ואני מסכים/ה ל<Link href="/he/privacy" target="_blank" className="underline text-navy-800">מדיניות הפרטיות</Link> ול<Link href="/he/terms" target="_blank" className="underline text-navy-800">תקנון</Link>,
              ומאשר/ת מסירת המידע שמילאתי, כולל מידע רגיש (מצב רפואי/נפשי ומצב ההורים) ותמונה, לצורך שידוך בלבד. אישרתי שיש לי הסכמה של האנשים שפרטיהם מסרתי לבירורים. <span className="text-burgundy-500">*</span>
            </span>
          </label>
          {errors.consent && <p className="text-sm text-burgundy-500 mt-2" role="alert">{errors.consent}</p>}
        </div>
      )}

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
        ) : editing && onCancel ? (
          <button type="button" onClick={onCancel}
            className="h-12 px-7 rounded-full border border-navy-200 text-navy-700 hover:bg-white text-sm font-semibold transition-colors">
            ביטול
          </button>
        ) : <span />}
        <button type="submit" disabled={submitting}
          className="h-12 min-w-40 px-9 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold transition-colors">
          {last ? (submitting ? (editing ? 'שומר...' : 'שולח...') : editing ? 'שמירת השינויים' : 'פרסם') : 'הבא'}
        </button>
      </div>
    </form>
  )
}
