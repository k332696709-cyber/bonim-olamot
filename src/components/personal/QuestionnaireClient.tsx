'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FEMALE_FORM, MALE_FORM } from '@/constants/registrationForms'
import { loadCandidate, type CandidateState } from '@/lib/auth/candidate'
import { TallyRegistrationForm } from '@/components/forms/TallyRegistrationForm'

/**
 * The questionnaire that follows the short registration. It saves as the person moves between steps,
 * shows how much is filled in, and once it reaches 100% the profile becomes visible to matchmakers.
 */
export function QuestionnaireClient({ locale }: { locale: string }) {
  const router = useRouter()
  const [state, setState] = useState<CandidateState | null>(null)

  useEffect(() => {
    let alive = true
    loadCandidate().then((c) => { if (alive) setState(c) })
    return () => { alive = false }
  }, [])

  const shell = (children: React.ReactNode) => (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir="rtl">
      <div className="hero-dark text-white text-center px-4 py-14 sm:py-20 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">שאלון היכרות</h1>
        <p className="text-navy-100 mt-3 max-w-xl mx-auto">אנחנו רוצים להכיר אתכם מעבר לרזומה. אפשר למלא בשלבים, והכול נשמר.</p>
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-24">{children}</div>
    </div>
  )

  if (!state) return shell(<p className="text-center text-navy-400 py-10">טוען...</p>)

  if (!state.gender) {
    return shell(
      <div className="rounded-[32px] bg-white shadow-card px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-navy-800 mb-2">השאלון נפתח אחרי הרשמה</h2>
        <p className="text-navy-500 mb-6">היכנסו עם החשבון שנרשמתם איתו, או הירשמו.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/login`} className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold inline-flex items-center justify-center">כניסה</Link>
          <Link href={`/${locale}/register/male`} className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold inline-flex items-center justify-center">הרשמה למיועדים</Link>
          <Link href={`/${locale}/register/female`} className="h-12 px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold inline-flex items-center justify-center">הרשמה למיועדות</Link>
        </div>
      </div>,
    )
  }

  return shell(
    <TallyRegistrationForm
      form={state.gender === 'female' ? FEMALE_FORM : MALE_FORM}
      endpoint="/api/candidate/questionnaire"
      mode="questionnaire"
      initialValues={state.answers ?? {}}
      onSaved={() => router.push(`/${locale}/personal`)}
    />,
  )
}
