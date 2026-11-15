'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

// The site key is public by design (it ships to every visitor's browser); only the secret key is private.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAGCEzy5rxjxDJvIz'

/** True once the Cloudflare site key is configured; until then the forms work without the check. */
export const TURNSTILE_ENABLED = SITE_KEY.length > 0

let scriptPromise: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { scriptPromise = null; reject(new Error('turnstile script failed')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

/**
 * Cloudflare Turnstile: a privacy-friendly check that the visitor is a person. It reports a
 * token through onToken (empty when it expires); the server verifies it. Bump `resetSignal`
 * after a failed submit to get a fresh token. Renders nothing when no site key is set.
 */
export function Turnstile({ onToken, resetSignal = 0, locale = 'he' }: { onToken: (token: string) => void; resetSignal?: number; locale?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        widget.current = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          language: locale === 'he' ? 'he' : 'en',
          callback: (t: string) => cb.current(t),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        })
      })
      .catch(() => { /* if Cloudflare is unreachable the server decides */ })
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [locale])

  useEffect(() => {
    if (resetSignal > 0 && widget.current && window.turnstile) {
      cb.current('')
      window.turnstile.reset(widget.current)
    }
  }, [resetSignal])

  if (!TURNSTILE_ENABLED) return null
  return <div ref={box} className="flex justify-center my-2" />
}
