'use client'

import { useEffect, useState } from 'react'
import { isGoogleLoginEnabled, signInWithGoogle } from '@/lib/auth/google'

/** "Continue with Google". Renders nothing until Google sign-in is switched on for the site. */
export function GoogleButton({ label, nextPath, className = '' }: { label: string; nextPath: string; className?: string }) {
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    isGoogleLoginEnabled().then((v) => { if (alive) setOn(v) })
    return () => { alive = false }
  }, [])

  if (!on) return null

  const go = async () => {
    setBusy(true)
    setError('')
    const { error: err } = await signInWithGoogle(nextPath)
    if (err) {
      setBusy(false)
      setError('ההתחברות עם גוגל לא הצליחה. נסו שוב.')
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="w-full h-12 rounded-full border border-navy-200 bg-white hover:bg-navy-50 disabled:opacity-60 text-navy-800 text-sm font-semibold inline-flex items-center justify-center gap-3 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
          <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.7l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {busy ? 'מעביר לגוגל...' : label}
      </button>
      {error && <p className="text-sm text-burgundy-500 text-center" role="alert">{error}</p>}
    </div>
  )
}
