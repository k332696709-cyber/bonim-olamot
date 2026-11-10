'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { clearSession, restoreSession } from '@/lib/auth/session'
import { loadCandidate, type CandidateState } from '@/lib/auth/candidate'
import {
  FEMALE_STYLE_OPTIONS, MALE_STYLE_OPTIONS, TRAIT_OPTIONS_FEMALE, TRAIT_OPTIONS_MALE,
} from '@/constants/formOptions'

const label = (opts: { value: string; he: string; en: string }[], v: string, he: boolean) => {
  const o = opts.find((x) => x.value === v)
  return o ? (he ? o.he : o.en) : v
}

/**
 * The candidate's own area. Right after registering it shows only the status ("waiting for
 * approval"). Once the administrator approves the registration, the candidate sees their full
 * profile and can use the smart assistant.
 */
export function CandidateArea({ locale }: { locale: string }) {
  const he = locale === 'he'
  const router = useRouter()
  const [state, setState] = useState<CandidateState | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [c, staff] = await Promise.all([loadCandidate(), restoreSession()])
      if (!alive) return
      setIsStaff(!!staff)
      setState(c)
    })()
    return () => { alive = false }
  }, [])

  const replacePhoto = async (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (files.length === 0) return
    setPhotoMsg('')
    if (files.length > 5) return setPhotoMsg(he ? 'אפשר להעלות עד 5 תמונות.' : 'You can upload up to 5 photos.')
    if (files.some((f) => !f.type.startsWith('image/'))) return setPhotoMsg(he ? 'יש לבחור קבצי תמונה.' : 'Please choose image files.')
    if (files.some((f) => f.size > 10 * 1024 * 1024)) return setPhotoMsg(he ? 'קובץ גדול מדי (עד 10 מגה-בייט לתמונה).' : 'File too large (max 10 MB each).')
    setUploading(true)
    try {
      const { data: sess } = await createClient().auth.getSession()
      const fd = new FormData()
      for (const f of files) fd.append('photo', f)
      const res = await fetch('/api/candidate/photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sess.session?.access_token ?? ''}` },
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPhotoMsg(json?.message ?? (he ? 'ההעלאה נכשלה.' : 'Upload failed.'))
      } else {
        setPhotoMsg(he ? 'התמונות הועלו וממתינות לאישור.' : 'Photos uploaded and waiting for approval.')
        setState(await loadCandidate())
      }
    } catch {
      setPhotoMsg(he ? 'ההעלאה נכשלה. בדקו את החיבור.' : 'Upload failed. Check your connection.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    clearSession()
    router.push(`/${locale}/login`)
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="hero-dark text-white text-center px-4 py-14 sm:py-20 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">{he ? 'האזור האישי' : 'My area'}</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-24">{children}</div>
    </div>
  )

  if (!state) return shell(<p className="text-center text-navy-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>)

  // Not signed in as a candidate
  if (state.status === 'signed_out' || state.status === 'not_candidate') {
    return shell(
      <div className="rounded-[32px] bg-white shadow-card px-6 py-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-2xl mb-5">🔒</div>
        {isStaff ? (
          <>
            <h2 className="text-xl font-bold text-navy-800 mb-2">{he ? 'אתה מחובר כשדכן/ית או מנהל' : 'You are signed in as a matchmaker or admin'}</h2>
            <Link href={`/${locale}/matchmaker`} className="inline-flex mt-4 h-12 items-center px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold">
              {he ? 'לאזור השדכנים' : 'Go to the matchmakers’ area'}
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-navy-800 mb-2">{he ? 'האזור האישי למי שנרשם' : 'The personal area is for registered candidates'}</h2>
            <p className="text-navy-500 mb-6">
              {he ? 'היכנסו עם המייל והסיסמה שבחרתם בהרשמה.' : 'Sign in with the email and password you chose when registering.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/${locale}/login`} className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold inline-flex items-center justify-center">
                {he ? 'כניסה' : 'Sign in'}
              </Link>
              <Link href={`/${locale}/register/male`} className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold inline-flex items-center justify-center">
                {he ? 'הרשמה למיועדים' : 'Register – men'}
              </Link>
              <Link href={`/${locale}/register/female`} className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold inline-flex items-center justify-center">
                {he ? 'הרשמה למיועדות' : 'Register – women'}
              </Link>
            </div>
          </>
        )}
      </div>,
    )
  }

  const a = state.answers ?? {}
  const submitted = state.submittedAt
    ? new Date(state.submittedAt).toLocaleDateString(he ? 'he-IL' : 'en-GB')
    : ''

  // Registered, waiting for the administrator
  if (state.status === 'pending') {
    return shell(
      <div className="rounded-[32px] bg-white shadow-card px-6 py-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-2xl mb-5">⏳</div>
        <h2 className="text-2xl font-bold text-navy-800 mb-2">
          {he ? `שלום ${a.fullName ?? ''}` : `Hello ${a.fullName ?? ''}`}
        </h2>
        <p className="text-navy-600 mb-1">
          {he ? 'ההרשמה שלך התקבלה וממתינה לאישור.' : 'Your registration was received and is waiting for approval.'}
        </p>
        <p className="text-navy-400 text-sm max-w-md mx-auto">
          {he
            ? `נשלחה בתאריך ${submitted}. אחרי שהמנהל יאשר אותה תראה כאן את הפרופיל המלא שלך, והשדכנים יוכלו לראות אותו.`
            : `Submitted on ${submitted}. Once the administrator approves it you will see your full profile here, and matchmakers will be able to see it.`}
        </p>
        <button onClick={signOut} className="mt-8 h-11 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold">
          {he ? 'יציאה' : 'Sign out'}
        </button>
      </div>,
    )
  }

  // Approved: the full profile
  const p = state.profile as any
  const styleOpts = state.gender === 'female' ? FEMALE_STYLE_OPTIONS : MALE_STYLE_OPTIONS
  const traitOpts = state.gender === 'female' ? TRAIT_OPTIONS_FEMALE : TRAIT_OPTIONS_MALE
  const rows: [string, string | undefined][] = [
    [he ? 'גיל' : 'Age', p?.age ? String(p.age) : undefined],
    [he ? 'עיר' : 'City', p?.city],
    [he ? 'קהילה' : 'Community', p?.community],
    [he ? 'עיסוק' : 'Occupation', p?.occupation],
    [he ? 'מצב משפחתי' : 'Marital status', p?.status],
    [he ? 'סגנון' : 'Style', p?.style ? label(styleOpts, p.style, he) : undefined],
    [he ? 'טלפון' : 'Phone', p?.phone],
    [he ? 'אימייל' : 'Email', p?.email],
  ]

  return shell(
    <div className="flex flex-col gap-5">
      <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-3">
          {state.photoUrl && (
            // Signed URL from private storage, so next/image is not used.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.photoUrl} alt="" className="w-24 h-24 rounded-3xl object-cover bg-[#f1f1f1]" />
          )}
          <div>
            <p className="text-xs font-semibold tracking-widest text-burgundy-500">{he ? 'הפרופיל שלי' : 'MY PROFILE'}</p>
            <h2 className="text-2xl font-bold text-navy-800">{p?.firstName} {p?.lastName}</h2>
          </div>
        </div>

        {/* Photo review status */}
        <div className="rounded-2xl bg-[#f1f1f1] px-4 py-3 mb-5 text-sm flex flex-col gap-2">
          <p className="text-navy-700">
            {state.photoStatus === 'approved' && (he ? '✓ התמונות אושרו ומוצגות למשתמשים.' : '✓ Your photos were approved and are shown to users.')}
            {state.photoStatus === 'pending' && (he ? '⏳ התמונות ממתינות לבדיקה. עד האישור רק את/ה רואה אותן.' : '⏳ Your photos are waiting for review. Until then only you can see them.')}
            {state.photoStatus === 'rejected' && (he ? '✗ התמונות לא אושרו. נא להעלות תמונות אחרות, ברורות ומתאימות.' : '✗ Your photos were not approved. Please upload other clear, suitable photos.')}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => replacePhoto(e.target.files)} />
            <button
              type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className={`h-10 px-5 rounded-full text-sm font-semibold disabled:opacity-60 ${state.photoStatus === 'rejected' ? 'bg-burgundy-500 hover:bg-burgundy-600 text-white' : 'border border-navy-200 text-navy-700 hover:bg-white'}`}
            >
              {uploading ? (he ? 'מעלה...' : 'Uploading…') : he ? 'החלפת תמונות (עד 5)' : 'Replace photos (up to 5)'}
            </button>
            {photoMsg && <span className="text-xs text-navy-600" role="status">{photoMsg}</span>}
          </div>
        </div>
        {(state.photoUrls?.length ?? 0) > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {state.photoUrls!.slice(1).map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={u} alt="" className="w-20 h-20 rounded-2xl object-cover bg-[#f1f1f1]" />
            ))}
          </div>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold text-navy-400">{k}</dt>
              <dd className="text-navy-800 break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {p?.traits?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {p.traits.map((tr: string) => (
              <span key={tr} className="rounded-full bg-navy-50 text-navy-600 text-xs px-3 py-1">{label(traitOpts, tr, he)}</span>
            ))}
          </div>
        )}
      </div>

      {p?.aboutMe && (
        <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-8">
          <h3 className="font-bold text-navy-800 mb-2">{he ? 'על עצמי' : 'About me'}</h3>
          <p className="whitespace-pre-wrap break-words text-sm text-navy-700 leading-relaxed">{p.aboutMe}</p>
        </div>
      )}
      {p?.aboutPartner && (
        <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-8">
          <h3 className="font-bold text-navy-800 mb-2">{he ? 'מה אני מחפש/ת' : 'What I am looking for'}</h3>
          <p className="whitespace-pre-wrap break-words text-sm text-navy-700 leading-relaxed">{p.aboutPartner}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/${locale}/smart-match`} className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold inline-flex items-center justify-center">
          {he ? 'לעוזר החכם' : 'To the smart assistant'}
        </Link>
        <button onClick={signOut} className="h-12 px-8 rounded-full border border-navy-200 text-navy-700 hover:bg-white text-sm font-semibold">
          {he ? 'יציאה' : 'Sign out'}
        </button>
      </div>
    </div>,
  )
}
