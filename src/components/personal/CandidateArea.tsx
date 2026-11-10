'use client'

import { useEffect, useState } from 'react'
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
        <div className="flex items-center gap-4 mb-5">
          {state.photoUrl && (
            // Signed URL from private storage, so next/image is not used.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.photoUrl} alt="" className="w-24 h-24 rounded-3xl object-cover bg-[#f1f1f1]" />
          )}
          <div>
            <p className="text-xs font-semibold tracking-widest text-burgundy-500">{he ? 'מאושר' : 'APPROVED'}</p>
            <h2 className="text-2xl font-bold text-navy-800">{p?.firstName} {p?.lastName}</h2>
          </div>
        </div>
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
