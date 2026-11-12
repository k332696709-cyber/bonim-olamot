'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { restoreSession, setSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'
import { loadCandidate } from '@/lib/auth/candidate'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const isHe = locale === 'he'

  // Already signed in (saved sign-in): go straight to the area, no password again.
  useEffect(() => {
    restoreSession().then(async (s) => {
      if (s) return router.replace(`/${locale}/matchmaker`)
      const c = await loadCandidate()
      if (c.status === 'pending' || c.status === 'approved') router.replace(`/${locale}/personal`)
    })
  }, [locale, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Asks Supabase to email a reset link. The answer is always the same, so nobody can use this
  // form to find out which emails have an account.
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      })
    } catch {
      /* same message either way */
    } finally {
      setLoading(false)
      setResetSent(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        setError(isHe ? 'פרטי הכניסה שגויים. נסה שוב.' : 'Incorrect credentials. Please try again.')
        return
      }

      // Matchmaker / admin?
      const { data: matchmaker } = await supabase
        .from('matchmakers')
        .select('id, first_name, last_name, email, is_admin')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      if (matchmaker) {
        setSession({
          name: `${matchmaker.first_name} ${matchmaker.last_name}`,
          email: matchmaker.email,
          role: matchmaker.is_admin ? 'admin' : 'matchmaker',
          matchmakerId: (matchmaker as any).id,
        })
        router.push(`/${locale}/matchmaker`)
        return
      }

      // Candidate (registered man / woman)?
      const candidate = await loadCandidate()
      if (candidate.status === 'pending' || candidate.status === 'approved') {
        router.push(`/${locale}/personal`)
        return
      }

      await supabase.auth.signOut()
      setError(isHe
        ? 'החשבון עדיין לא אושר. אם נרשמת כשדכן/ית, הבקשה ממתינה לאישור מנהל המערכת.'
        : 'This account is not approved yet. If you applied as a matchmaker, your request is waiting for the administrator.')
      return

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]">
      <PageHero
        badge={isHe ? 'כניסה למערכת' : 'Sign in'}
        title={isHe ? 'ברוכים השבים' : 'Welcome back'}
        subtitle={isHe ? 'מועמדים, שדכנים ומנהל: היכנסו עם המייל והסיסמה שלכם' : 'Candidates, matchmakers and admins: sign in with your email and password'}
      />
      <div className="w-full max-w-md mx-auto px-4 pb-16 -mt-12 relative">
        <div className="bg-white rounded-[28px] shadow-card px-8 py-10">
          {forgot ? (
            <form onSubmit={handleForgot} className="flex flex-col gap-4" dir={isHe ? 'rtl' : 'ltr'}>
              <h2 className="text-lg font-bold text-navy-800">{isHe ? 'שכחתי סיסמה' : 'Forgot password'}</h2>
              {resetSent ? (
                <p className="text-sm text-navy-600 leading-relaxed" role="status">
                  {isHe
                    ? 'אם קיים חשבון עם המייל הזה, נשלח אליו קישור לבחירת סיסמה חדשה. כדאי לבדוק גם בתיקיית הספאם.'
                    : 'If an account exists for this email, a link to choose a new password was sent. Check your spam folder too.'}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">{isHe ? 'הקלידו את המייל שאיתו נרשמתם ונשלח אליו קישור.' : 'Enter the email you signed up with and we will send you a link.'}</p>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" autoComplete="email" required
                    aria-label={isHe ? 'כתובת דוא"ל' : 'Email address'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition"
                  />
                  <button type="submit" disabled={loading || !email.trim()} className="w-full py-3.5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold shadow-md transition-all">
                    {loading ? (isHe ? 'שולח...' : 'Sending…') : isHe ? 'שליחת קישור' : 'Send link'}
                  </button>
                </>
              )}
              <button type="button" onClick={() => { setForgot(false); setResetSent(false) }} className="text-sm text-navy-500 underline self-center">
                {isHe ? 'חזרה לכניסה' : 'Back to sign in'}
              </button>
            </form>
          ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4" dir={isHe ? 'rtl' : 'ltr'}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {isHe ? 'כתובת דוא"ל' : 'Email address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isHe ? 'שדכן@bonim-olamot.co.il' : 'matchmaker@bonim-olamot.co.il'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700
                  placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-300
                  focus:border-navy-400 transition"
                dir="ltr"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                {isHe ? 'סיסמה' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700
                  placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-300
                  focus:border-navy-400 transition"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60
                text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150"
            >
              {loading
                ? (isHe ? 'מתחבר...' : 'Signing in...')
                : (isHe ? 'כניסה' : 'Sign In')}
            </button>
            <button type="button" onClick={() => { setForgot(true); setError('') }} className="text-sm text-navy-500 underline self-center">
              {isHe ? 'שכחתי סיסמה' : 'Forgot password?'}
            </button>
          </form>
          )}
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="text-xs text-gray-400 hover:text-navy-500 transition-colors"
          >
            {isHe ? '← חזרה לדף הבית' : '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
