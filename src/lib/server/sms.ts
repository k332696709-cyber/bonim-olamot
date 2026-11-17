/**
 * Sends an SMS through Twilio's REST API. It stays switched off until TWILIO_ACCOUNT_SID,
 * TWILIO_AUTH_TOKEN and a sender (TWILIO_FROM: a number or an alphanumeric name; or a Messaging
 * Service id starting with MG) are set in the environment.
 */

/** An Israeli mobile number in international form (+972...), or null if it does not look right. */
export function toSmsNumber(raw: string | undefined | null): string | null {
  const digits = (raw ?? '').replace(/[^\d+]/g, '')
  if (!digits) return null
  let d = digits.startsWith('+') ? digits.slice(1) : digits
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('972')) d = d.slice(3)
  else if (d.startsWith('0')) d = d.slice(1)
  if (!/^5\d{8}$/.test(d)) return null
  return `+972${d}`
}

export const smsConfigured = () =>
  !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)

/** Returns true when the provider accepted the message. Never throws: a notice must not break the request. */
export async function sendSms(to: string, text: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM
  if (!sid || !token || !from || !to) return false
  try {
    const form = new URLSearchParams({ To: to, Body: text })
    if (from.startsWith('MG')) form.set('MessagingServiceSid', from)
    else form.set('From', from)
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('sms send failed:', res.status, (await res.text()).slice(0, 200))
      return false
    }
    return true
  } catch (e) {
    console.error('sms send error:', e instanceof Error ? e.message : e)
    return false
  }
}
