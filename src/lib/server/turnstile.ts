/**
 * Verifies a Cloudflare Turnstile token on the server. If TURNSTILE_SECRET_KEY is not set the
 * check is switched off (returns true), so the site keeps working until the keys are added.
 * If Cloudflare itself cannot be reached the visitor is let through: a Cloudflare outage must
 * not block registrations (the honeypot and rate limits still apply).
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  const t = typeof token === 'string' ? token.trim() : ''
  if (!t || t.length > 2048) return false
  try {
    const body = new URLSearchParams({ secret, response: t })
    if (ip && ip !== 'unknown') body.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    const json = await res.json()
    return json?.success === true
  } catch (e) {
    console.error('turnstile verify unreachable:', e instanceof Error ? e.message : e)
    return true
  }
}

export const TURNSTILE_FAILED_MESSAGE = 'לא הצלחנו לוודא שאתם לא רובוט. רעננו את העמוד ונסו שוב.'
