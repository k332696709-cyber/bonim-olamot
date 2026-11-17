import { createClient } from '@/lib/supabase/client'

let enabled: boolean | null = null

/**
 * Whether "continue with Google" is switched on in the Supabase project. The buttons are shown
 * only then, so nobody sees a button that does not work yet.
 */
export async function isGoogleLoginEnabled(): Promise<boolean> {
  if (enabled !== null) return enabled
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return (enabled = false)
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    const json = await res.json()
    enabled = !!json?.external?.google
  } catch {
    enabled = false
  }
  return enabled
}

/** Sends the visitor to Google; they come back to `nextPath` already signed in. */
export async function signInWithGoogle(nextPath: string) {
  return createClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${nextPath}`,
      queryParams: { prompt: 'select_account' },
    },
  })
}

/** The email of the Google account the visitor is signed in with, or null. */
export async function currentGoogleEmail(): Promise<string | null> {
  const { data } = await createClient().auth.getSession()
  const user = data.session?.user
  const isGoogle = (user?.identities ?? []).some((i) => i.provider === 'google')
  return isGoogle && user?.email ? user.email : null
}
