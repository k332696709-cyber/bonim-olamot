/* eslint-disable */
// Server-only helpers for the messages between matchmakers and candidates.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/server/notify'
import { sendSms, toSmsNumber } from '@/lib/server/sms'

export const MAX_MESSAGE = 2000

export function serviceClient(): any | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** The signed-in matchmaker or administrator behind a request, or an error response. */
export async function staffFrom(req: NextRequest): Promise<{ admin: any; mm: any } | { error: NextResponse }> {
  const admin = serviceClient()
  if (!admin) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: mm } = await admin.from('matchmakers').select('id, email, first_name, last_name, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return { error: NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 }) }
  return { admin, mm }
}

/** The login, contact details and name of the candidate who has this profile. */
export async function candidateOfProfile(admin: any, profileId: string) {
  for (const table of ['male_registrations', 'female_registrations']) {
    const { data } = await admin.from(table).select('user_id, answers').eq('profile_id', profileId).maybeSingle()
    if (data?.user_id) {
      const a = data.answers ?? {}
      return {
        userId: data.user_id as string,
        profileId,
        email: String(a.email ?? ''),
        phone: String(a.phone ?? ''),
        sms: a.notifySms === '1',
        name: `${a.fullName ?? ''} ${a.lastName ?? ''}`.trim(),
      }
    }
  }
  return null
}

/** Tells the candidate there is a message: always by email, by SMS only if they switched it on. */
export async function notifyCandidateOfMessage(c: { email: string; phone: string; sms: boolean }, who: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://bonim-olamot-zoco.vercel.app'
  if (c.email) {
    await sendMail(c.email, 'הודעה חדשה מהשדכן/ית', [`${who || 'השדכן/ית'} כתב/ה לך הודעה באתר.`, 'אפשר להיכנס, לקרוא ולהשיב.'], '/he/personal#messages')
  }
  if (c.sms) {
    const n = toSmsNumber(c.phone)
    if (n) await sendSms(n, `בונים עולמות: ${who || 'השדכן/ית'} כתב/ה לך הודעה. ${site}/he/personal#messages`)
  }
}

export const clean = (v: unknown) => String(v ?? '').replace(/\r/g, '').trim().slice(0, MAX_MESSAGE)
