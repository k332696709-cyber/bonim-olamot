import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const intlMiddleware = createIntlMiddleware({
  locales: ['he', 'en'],
  defaultLocale: 'he',
})

export async function middleware(request: NextRequest) {
  // Run i18n middleware first to get the locale-aware response
  const response = intlMiddleware(request)

  // Without Supabase env vars (e.g. a Vercel project that was never configured)
  // createServerClient throws, which used to crash every request with a 500
  // (MIDDLEWARE_INVOCATION_FAILED). Skip the session refresh instead.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return response

  // Refresh Supabase session so it doesn't expire mid-session
  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })
    await supabase.auth.getUser()
  } catch {
    // Never let a session-refresh failure take the whole site down
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
