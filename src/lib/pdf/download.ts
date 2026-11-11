import { createClient } from '@/lib/supabase/client'

/**
 * Asks the server for a profile PDF and saves it. The matchmaker's sign-in token is sent so the
 * server can read the profile from the database (only matchmakers can) and nobody else can.
 * Throws an Error with a readable message on failure.
 */
export async function downloadProfilePdf(opts: { id: string; type?: 'card' | 'full'; locale?: string }) {
  const { id, type = 'card', locale = 'he' } = opts
  const { data } = await createClient().auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error(locale === 'he' ? 'ההתחברות פגה. היכנסו מחדש.' : 'Your sign-in expired. Please sign in again.')

  const res = await fetch(`/api/export/profile/${id}?type=${type}&locale=${locale}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail ?? body.error ?? detail
    } catch { /* ignore */ }
    throw new Error(detail)
  }
  const blob = await res.blob()
  if (blob.size === 0) throw new Error(locale === 'he' ? 'התקבל קובץ ריק' : 'Empty file received')

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type === 'full' ? 'resume' : 'card'}-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
