'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { MAX_PHOTO_BYTES, MIN_AGE, SPECIALTIES } from '@/constants/matchmakerForm'

type Gender = 'male' | 'female' | ''

/** Matchmaker registration. The request is reviewed by the administrator on the Team page. */
export function MatchmakerRegistrationForm({ locale = 'he' }: { locale?: string }) {
  const he = locale === 'he'
  const t = (h: string, e: string) => (he ? h : e)

  const [gender, setGender] = useState<Gender>('')
  const [v, setV] = useState({
    firstName: '', lastName: '', phone: '', email: '', birthDate: '', biography: '',
    yearsExperience: '', matchesClosed: '', city: '', languages: '', password: '', confirmPassword: '',
  })
  const [specialties, setSpecialties] = useState<string[]>([])
  const [photo, setPhoto] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [consent, setConsent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof typeof v, value: string) => {
    setV((s) => ({ ...s, [k]: value }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }
  const digits = (k: keyof typeof v, value: string) => set(k, value.replace(/\D/g, ''))

  const allSelected = specialties.length === SPECIALTIES.length
  const toggleAll = () => {
    setSpecialties(allSelected ? [] : SPECIALTIES.map((s) => s.value))
    setErrors((e) => ({ ...e, specialties: '' }))
  }
  const toggleSpec = (value: string) => {
    setSpecialties((s) => (s.includes(value) ? s.filter((x) => x !== value) : [...s, value]))
    setErrors((e) => ({ ...e, specialties: '' }))
  }

  const maxBirth = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - MIN_AGE)
    return d.toISOString().slice(0, 10)
  })()

  const pickPhoto = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((e) => ({ ...e, photo: t('יש לבחור קובץ תמונה', 'Please choose an image file') }))
    if (file.size > MAX_PHOTO_BYTES) return setErrors((e) => ({ ...e, photo: t('הקובץ גדול מדי (עד 10 מגה-בייט)', 'File too large (max 10 MB)') }))
    setPhoto(file)
    setErrors((e) => ({ ...e, photo: '' }))
  }

  const validate = () => {
    const err: Record<string, string> = {}
    const req = t('שדה חובה', 'Required')
    if (!gender) err.gender = t('יש לבחור שדכן או שדכנית', 'Please choose')
    if (v.firstName.trim().length < 2) err.firstName = req
    if (v.lastName.trim().length < 2) err.lastName = req
    if (!/^05\d{8}$/.test(v.phone)) err.phone = t('מספר טלפון לא תקין (05XXXXXXXX)', 'Invalid phone (05XXXXXXXX)')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) err.email = t('כתובת מייל לא תקינה', 'Invalid email')
    if (!v.birthDate) err.birthDate = t('יש לבחור תאריך לידה', 'Please pick a date of birth')
    else if (v.birthDate > maxBirth) err.birthDate = t(`גיל מינימלי: ${MIN_AGE}`, `Minimum age: ${MIN_AGE}`)
    if (v.biography.trim().length < 10) err.biography = t('נא לכתוב כמה מילים על עצמך', 'Please write a few words about yourself')
    if (v.yearsExperience === '') err.yearsExperience = req
    if (v.matchesClosed === '') err.matchesClosed = req
    if (v.city.trim().length < 2) err.city = req
    if (specialties.length === 0) err.specialties = t('יש לבחור לפחות תחום אחד', 'Pick at least one')
    if (v.languages.trim().length < 2) err.languages = req
    if (v.password.length < 10) err.password = t('לפחות 10 תווים', 'At least 10 characters')
    if (!consent) err.consent = t('יש לאשר את ההסכמה', 'Please accept to continue')
    if (v.confirmPassword !== v.password) err.confirmPassword = t('הסיסמאות אינן תואמות', 'Passwords do not match')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('gender', gender)
      for (const k of ['firstName', 'lastName', 'phone', 'email', 'birthDate', 'biography', 'yearsExperience', 'matchesClosed', 'city', 'languages', 'password'] as const) {
        fd.append(k, v[k].trim())
      }
      specialties.forEach((s) => fd.append('specialties', s))
      if (photo) fd.append('photo', photo)
      fd.append('consent', '1')
      fd.append('website', (document.getElementById('mm-website') as HTMLInputElement | null)?.value ?? '')
      const res = await fetch('/api/register/matchmaker', { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (json?.fields) setErrors(json.fields)
        setServerError(json?.message ?? t('השליחה נכשלה. נסו שוב.', 'Submission failed. Please try again.'))
        return
      }
      setDone(true)
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      setServerError(t('השליחה נכשלה. בדקו את החיבור ונסו שוב.', 'Submission failed. Check your connection and try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div ref={topRef} dir={he ? 'rtl' : 'ltr'} className="rounded-[32px] bg-white shadow-card px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-3xl mb-5">✓</div>
        <h2 className="text-2xl font-bold text-navy-800 mb-2">{t('בקשתך התקבלה!', 'Request received!')}</h2>
        <p className="text-navy-500 max-w-md mx-auto">
          {t(
            'הבקשה ממתינה לאישור מנהל המערכת. אחרי האישור תוכלו להיכנס עם המייל והסיסמה שבחרתם.',
            'Your request is waiting for the administrator’s approval. Once approved you can sign in with the email and password you chose.',
          )}
        </p>
      </div>
    )
  }

  const input =
    'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-navy-800 placeholder:text-navy-300 ' +
    'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-colors'
  const border = (k: string) => (errors[k] ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300')
  const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
    <label className="text-[15px] font-semibold text-navy-800">
      {children}
      {req && <span className="text-burgundy-500 ms-1" aria-hidden>*</span>}
    </label>
  )
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="text-sm text-burgundy-500" role="alert">{errors[k]}</p> : null)

  return (
    <form onSubmit={submit} noValidate dir={he ? 'rtl' : 'ltr'} className="flex flex-col gap-6 pb-10">
      <div ref={topRef} className="scroll-mt-28" />

      <p className="self-center rounded-full bg-white shadow-card px-4 py-1.5 text-xs text-navy-500">{t('שדות המסומנים ב-* הם חובה', 'Fields marked * are required')}</p>

      <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-9 flex flex-col gap-6">
        {/* Gender */}
        <fieldset className="flex flex-col gap-2">
          <legend><Label req>{t('שדכן/שדכנית', 'Matchmaker')}</Label></legend>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {([['male', t('שדכן', 'Male matchmaker')], ['female', t('שדכנית', 'Female matchmaker')]] as const).map(([val, label]) => (
              <label
                key={val}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition-colors ${
                  gender === val ? 'border-navy-800 bg-navy-50' : errors.gender ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300'
                }`}
              >
                <input
                  type="radio" name="gender" value={val} checked={gender === val} className="sr-only"
                  onChange={() => { setGender(val); setErrors((e) => ({ ...e, gender: '' })) }}
                />
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${gender === val ? 'border-navy-800' : 'border-navy-300'}`}>
                  {gender === val && <span className="w-2.5 h-2.5 rounded-full bg-navy-800" />}
                </span>
                <span className="font-medium text-navy-800">{label}</span>
              </label>
            ))}
          </div>
          <Err k="gender" />
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label req>{t('שם פרטי', 'First name')}</Label>
            <input className={`${input} ${border('firstName')}`} value={v.firstName} maxLength={60} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" />
            <Err k="firstName" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('שם משפחה', 'Last name')}</Label>
            <input className={`${input} ${border('lastName')}`} value={v.lastName} maxLength={60} onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" />
            <Err k="lastName" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('טלפון', 'Phone')}</Label>
            <input className={`${input} ${border('phone')}`} type="tel" inputMode="tel" dir="ltr" placeholder="0501234567" value={v.phone} maxLength={10} onChange={(e) => digits('phone', e.target.value)} autoComplete="tel" />
            <Err k="phone" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('אימייל', 'Email')}</Label>
            <input className={`${input} ${border('email')}`} type="email" dir="ltr" placeholder="example@email.com" value={v.email} maxLength={120} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            <Err k="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('תאריך לידה', 'Date of birth')}</Label>
            <input className={`${input} ${border('birthDate')}`} type="date" max={maxBirth} min="1920-01-01" value={v.birthDate} onChange={(e) => set('birthDate', e.target.value)} autoComplete="bday" />
            <Err k="birthDate" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('עיר מגורים', 'City of residence')}</Label>
            <input className={`${input} ${border('city')}`} value={v.city} maxLength={80} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" />
            <Err k="city" />
          </div>
        </div>

        {/* Photo (optional) */}
        <div className="flex flex-col gap-1.5">
          <Label>{t('תמונה', 'Photo')}</Label>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickPhoto(e.dataTransfer.files?.[0] ?? null) }}
            className={`rounded-2xl border-2 border-dashed ${errors.photo ? 'border-burgundy-400' : 'border-navy-200 hover:border-navy-400'} bg-[#f7f8fa] px-4 py-7 text-center transition-colors`}
          >
            {photo ? (
              <span className="block text-navy-800 font-medium">✓ {photo.name}</span>
            ) : (
              <span className="block text-navy-600 font-medium">{t('לחץ כדי לבחור תמונה או גרור לכאן', 'Click to choose a photo or drag it here')}</span>
            )}
            <span className="block text-sm text-navy-400 mt-1">{t('לא חובה · עד 10 מגה-בייט', 'Optional · up to 10 MB')}</span>
          </button>
          {photo && (
            <button type="button" onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = '' }} className="self-start text-sm text-navy-500 underline">
              {t('הסרת התמונה', 'Remove photo')}
            </button>
          )}
          <p className="text-sm text-navy-500">
            {t('התמונה מוצגת גם למשתמשים, כלומר גם למיועדים וגם למיועדות.', 'The photo is shown to users, both men and women candidates.')}
          </p>
          <Err k="photo" />
        </div>

        {/* Biography */}
        <div className="flex flex-col gap-1.5">
          <Label req>{t('ביוגרפיה', 'Biography')}</Label>
          <textarea
            className={`${input} ${border('biography')} resize-y min-h-[110px]`} rows={4} maxLength={1500}
            placeholder={
              he
                ? gender === 'female'
                  ? 'לדוגמה: אני שדכנית כבר 4 שנים. עובדת בעיקר מול המגזר החסידי.'
                  : 'לדוגמה: אני שדכן כבר 4 שנים. עובד בעיקר מול המגזר החסידי.'
                : 'For example: I have been a matchmaker for 4 years, working mainly with the Hasidic community.'
            }
            value={v.biography} onChange={(e) => set('biography', e.target.value)}
          />
          <Err k="biography" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label req>{t('שנות ניסיון', 'Years of experience')}</Label>
            <input className={`${input} ${border('yearsExperience')}`} inputMode="numeric" dir="ltr" maxLength={2} placeholder="0" value={v.yearsExperience} onChange={(e) => digits('yearsExperience', e.target.value)} />
            <Err k="yearsExperience" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('כמה שידוכים סגרתי', 'Matches I have closed')}</Label>
            <input className={`${input} ${border('matchesClosed')}`} inputMode="numeric" dir="ltr" maxLength={6} placeholder="0" value={v.matchesClosed} onChange={(e) => digits('matchesClosed', e.target.value)} />
            <Err k="matchesClosed" />
          </div>
        </div>

        {/* Specialties */}
        <fieldset className="flex flex-col gap-2">
          <legend><Label req>{t('תחומי התמחות', 'Specialties')}</Label></legend>
          <p className="text-sm text-navy-400">{t('אפשר לבחור יותר מאחד', 'You can choose more than one')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button" onClick={toggleAll} aria-pressed={allSelected}
              className={`h-11 px-5 rounded-full border text-sm font-medium transition-colors ${allSelected ? 'bg-navy-800 border-navy-800 text-white' : 'border-navy-200 text-navy-700 hover:border-navy-400 bg-white'}`}
            >
              {t('הכל', 'All')}
            </button>
            {SPECIALTIES.map((s) => {
              const on = specialties.includes(s.value)
              return (
                <button
                  key={s.value} type="button" onClick={() => toggleSpec(s.value)} aria-pressed={on}
                  className={`h-11 px-5 rounded-full border text-sm font-medium transition-colors ${on ? 'bg-navy-800 border-navy-800 text-white' : 'border-navy-200 text-navy-700 hover:border-navy-400 bg-white'}`}
                >
                  {he ? s.he : s.en}
                </button>
              )
            })}
          </div>
          <Err k="specialties" />
        </fieldset>

        {/* Languages */}
        <div className="flex flex-col gap-1.5">
          <Label req>{t('שפות', 'Languages')}</Label>
          <input
            className={`${input} ${border('languages')}`} maxLength={150}
            placeholder={t('לדוגמה: עברית, אנגלית, יידיש', 'For example: Hebrew, English, Yiddish')}
            value={v.languages} onChange={(e) => set('languages', e.target.value)}
          />
          <Err k="languages" />
        </div>
      </div>

      {/* Sign-in password */}
      <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-9 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-800">{t('סיסמה לכניסה', 'Sign-in password')}</h2>
          <p className="text-sm text-navy-400">{t('תשמש אתכם לכניסה אחרי שהמנהל יאשר את הבקשה', 'You will use it to sign in once the administrator approves your request')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label req>{t('סיסמה (לפחות 10 תווים)', 'Password (at least 10 characters)')}</Label>
            <input className={`${input} ${border('password')}`} type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={v.password} onChange={(e) => set('password', e.target.value)} />
            <Err k="password" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label req>{t('אימות סיסמה', 'Confirm password')}</Label>
            <input className={`${input} ${border('confirmPassword')}`} type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={v.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
            <Err k="confirmPassword" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-card px-5 py-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" checked={consent} className="mt-1 w-5 h-5 accent-burgundy-500 shrink-0"
            onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setErrors((er) => ({ ...er, consent: '' })) }}
          />
          <span className="text-sm text-navy-700 leading-relaxed">
            {he ? (
              <>קראתי ואני מסכים/ה ל<Link href="/he/privacy" target="_blank" className="underline text-navy-800">מדיניות הפרטיות</Link> ול<Link href="/he/terms" target="_blank" className="underline text-navy-800">תקנון</Link>, ומאשר/ת שהפרטים שמסרתי (כולל התמונה, אם העליתי) ישמשו לבדיקת הבקשה, ולהצגתי למשתמשי האתר אם אאושר. </>
            ) : (
              <>I have read and accept the <Link href="/en/privacy" target="_blank" className="underline text-navy-800">Privacy Policy</Link> and <Link href="/en/terms" target="_blank" className="underline text-navy-800">Terms</Link>, and agree that the details I provided (including the photo, if uploaded) are used to review my request and shown to site users if I am approved. </>
            )}
            <span className="text-burgundy-500">*</span>
          </span>
        </label>
        {errors.consent && <p className="text-sm text-burgundy-500 mt-2" role="alert">{errors.consent}</p>}
      </div>

      {/* Honeypot: hidden from people, filled by bots */}
      <input id="mm-website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {serverError && (
        <div className="rounded-2xl bg-burgundy-50 border border-burgundy-200 px-5 py-4 text-sm font-medium text-burgundy-600" role="alert">{serverError}</div>
      )}
      {Object.values(errors).some(Boolean) && !serverError && (
        <div className="rounded-2xl bg-burgundy-50 border border-burgundy-200 px-5 py-4 text-sm font-medium text-burgundy-600" role="alert">
          {t('יש שדות שדורשים תיקון.', 'Some fields need fixing.')}
        </div>
      )}

      <div className="flex justify-center">
        <button type="submit" disabled={submitting} className="h-12 min-w-52 px-9 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold transition-colors">
          {submitting ? t('שולח...', 'Submitting…') : t('שליחת בקשה', 'Submit request')}
        </button>
      </div>
    </form>
  )
}
