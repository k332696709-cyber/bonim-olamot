'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { createClient } from '@/lib/supabase/client'
import { clearSession } from '@/lib/auth/session'

/**
 * Opened from the password-reset email. The link carries a one-time token; it is checked only when
 * the person submits the new password, so email scanners that open links cannot use it up, and the
 * link works on any device (it does not depend on the browser that asked for the reset).
 */
export default function ResetPasswordPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const search = useSearchParams()
  const tokenHash = search.get('token_hash')
  const code = search.get('code')
  const hasLink = !!(tokenHash || code)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 10) return setError(he ? 'הסיסמה חייבת להכיל לפחות 10 תווים.' : 'The password must be at least 10 characters.')
    if (password !== confirm) return setError(he ? 'הסיסמאות אינן תואמות.' : 'The passwords do not match.')
    setBusy(true)
    try {
      const supabase = createClient()
      const verified = tokenHash
        ? await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash })
        : await supabase.auth.exchangeCodeForSession(code ?? '')
      if (verified.error) {
        setError(he ? 'הקישור פג תוקף או כבר נוצל. אפשר לבקש קישור חדש מדף הכניסה.' : 'This link expired or was already used. Request a new one from the sign-in page.')
        return
      }
      const { error: updErr } = await supabase.auth.updateUser({ password })
      if (updErr) {
        setError(he ? 'עדכון הסיסמה נכשל. נסו סיסמה אחרת, או בקשו קישור חדש.' : 'Could not update the password. Try another one, or request a new link.')
        return
      }
      await supabase.auth.signOut()
      clearSession()
      setDone(true)
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition'

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <PageHero
        badge={he ? 'איפוס סיסמה' : 'Password reset'}
        title={he ? 'בוחרים סיסמה חדשה' : 'Choose a new password'}
        subtitle={he ? 'הסיסמה צריכה להכיל לפחות 10 תווים.' : 'The password must be at least 10 characters.'}
      />
      <div className="w-full max-w-md mx-auto px-4 pb-16 -mt-12 relative">
        <div className="bg-white rounded-[28px] shadow-card px-8 py-10">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-navy-800 text-white flex items-center justify-center text-2xl mb-4">{'✓'}</div>
              <h2 className="text-xl font-bold text-navy-800 mb-2">{he ? 'הסיסמה עודכנה' : 'Password updated'}</h2>
              <p className="text-sm text-navy-500 mb-6">{he ? 'אפשר להיכנס עכשיו עם הסיסמה החדשה.' : 'You can now sign in with the new password.'}</p>
              <Link href={`/${locale}/login`} className="inline-flex h-12 items-center px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold">
                {he ? 'כניסה' : 'Sign in'}
              </Link>
            </div>
          ) : !hasLink ? (
            <div className="text-center">
              <p className="text-sm text-navy-600 mb-5">
                {he ? 'הקישור חסר או לא תקין. אפשר לבקש קישור חדש מדף הכניסה.' : 'The link is missing or invalid. You can request a new one from the sign-in page.'}
              </p>
              <Link href={`/${locale}/login`} className="inline-flex h-12 items-center px-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold">
                {he ? 'לדף הכניסה' : 'To sign in'}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="np" className="text-sm font-medium text-gray-700">{he ? 'סיסמה חדשה' : 'New password'}</label>
                <input id="np" type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className={input} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="np2" className="text-sm font-medium text-gray-700">{he ? 'אימות סיסמה' : 'Confirm password'}</label>
                <input id="np2" type="password" dir="ltr" autoComplete="new-password" maxLength={72} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} required />
              </div>
              {error && <p className="text-sm text-red-500 text-center" role="alert">{error}</p>}
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold shadow-md transition-all">
                {busy ? (he ? 'שומר...' : 'Saving…') : he ? 'שמירת סיסמה' : 'Save password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
