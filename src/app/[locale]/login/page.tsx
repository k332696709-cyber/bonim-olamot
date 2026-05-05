'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { setSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const isHe = locale === 'he'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

      // Fetch matchmaker profile
      const { data: matchmaker, error: dbError } = await supabase
        .from('matchmakers')
        .select('first_name, last_name, email, is_admin')
        .eq('email', authData.user.email!)
        .single()

      if (dbError || !matchmaker) {
        await supabase.auth.signOut()
        setError(isHe ? 'משתמש זה אינו רשום כשדכן.' : 'This user is not registered as a matchmaker.')
        return
      }

      setSession({
        name: `${matchmaker.first_name} ${matchmaker.last_name}`,
        email: matchmaker.email,
        role: matchmaker.is_admin ? 'admin' : 'matchmaker',
      })

      router.push(`/${locale}/matchmaker`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-luxury px-8 py-10">
          <h1 className="text-2xl font-bold font-serif text-navy-700 text-center mb-1">
            {isHe ? 'כניסה למערכת שדכנים' : 'Matchmaker Login'}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-8">
            {isHe ? 'גישה לממשק הניהול – בונים עולמות' : 'Access the management dashboard'}
          </p>

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
              className="w-full py-3 rounded-xl bg-navy-600 hover:bg-navy-700 disabled:opacity-60
                text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150"
            >
              {loading
                ? (isHe ? 'מתחבר...' : 'Signing in...')
                : (isHe ? 'כניסה' : 'Sign In')}
            </button>
          </form>
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
