'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { setSession } from '@/lib/auth/session'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const isHe = locale === 'he'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Demo credentials – replace with real auth when backend is ready
    const DEMO_EMAIL = 'shadchan@bonim-olamot.co.il'
    const DEMO_PASSWORD = 'demo1234'

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setSession({ name: 'שדכן ראשי', email, role: 'matchmaker' })
      router.push(`/${locale}/matchmaker`)
    } else {
      setError(isHe ? 'פרטי הכניסה שגויים. נסה שוב.' : 'Incorrect credentials. Please try again.')
    }
  }

  const handleDemoLogin = () => {
    setSession({ name: 'שדכן ראשי', email: 'shadchan@bonim-olamot.co.il', role: 'matchmaker' })
    router.push(`/${locale}/matchmaker`)
  }

  const handleAdminDemoLogin = () => {
    setSession({ name: 'מנהל ראשי', email: 'admin@bonim-olamot.co.il', role: 'admin' })
    router.push(`/${locale}/matchmaker`)
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

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6" dir={isHe ? 'rtl' : 'ltr'}>
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
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-sm
                font-bold shadow-md hover:shadow-lg transition-all duration-150"
            >
              {isHe ? 'כניסה' : 'Sign In'}
            </button>
          </form>

          {/* Demo notice */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {isHe
                ? 'מצב הדגמה – לחץ "כניסה מהירה לדמו" כדי לדלג על האימות.'
                : 'Demo mode – click "Quick Demo Login" to skip authentication.'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl border border-navy-200 text-navy-600 text-sm
                font-semibold hover:bg-navy-50 transition-colors duration-150"
            >
              {isHe ? 'כניסה מהירה – שדכן ←' : 'Quick Demo – Matchmaker →'}
            </button>
            <button
              type="button"
              onClick={handleAdminDemoLogin}
              className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-600 text-sm
                font-semibold hover:bg-purple-50 transition-colors duration-150"
            >
              {isHe ? 'כניסה מהירה – מנהל ←' : 'Quick Demo – Admin →'}
            </button>
          </div>
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
