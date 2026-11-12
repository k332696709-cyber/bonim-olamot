import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { allFields, FEMALE_FORM, MALE_FORM, validateField } from '@/constants/registrationForms'
import { registrationToProfileRow } from '@/lib/registration/toProfile'
import { findRegistration } from '@/lib/server/photos'

export const runtime = 'nodejs'

/**
 * A signed-in candidate updates their own answers after registering. The email is the login and
 * cannot change here. The profile that matchmakers see is rebuilt from the new answers; its
 * status, notes and lock are left alone, and its photos stay the approved ones.
 */
export async function PUT(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const found = await findRegistration(admin, caller.user.id)
  if (!found) return NextResponse.json({ message: 'לא נמצאה הרשמה.' }, { status: 404 })

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  const form = found.gender === 'male' ? MALE_FORM : FEMALE_FORM
  const existing: Record<string, string> = found.reg.answers ?? {}
  const answers: Record<string, string> = {}
  const fields: Record<string, string> = {}
  for (const f of allFields(form)) {
    if (f.type === 'file') continue
    // The email is the login: keep what is on record.
    const v = f.id === 'email' ? String(existing.email ?? '') : String(fd.get(f.id) ?? '').trim()
    answers[f.id] = v
    const err = validateField(f, v)
    if (err) fields[f.id] = err
  }
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields }, { status: 422 })
  }

  const merged = { ...existing, ...answers, updatedAt: new Date().toISOString() }
  const { error: updErr } = await admin.from(found.table).update({ answers: merged }).eq('id', found.reg.id)
  if (updErr) {
    console.error('candidate profile update failed:', updErr.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  if (found.reg.profile_id) {
    const { data: photos } = await admin
      .from('candidate_photos').select('path').eq('user_id', caller.user.id).eq('status', 'approved').order('position')
    const row = registrationToProfileRow(found.gender, merged, (photos ?? []).map((p: any) => p.path))
    const { error: profErr } = await admin.from('profiles').update(row).eq('id', found.reg.profile_id)
    if (profErr) {
      console.error('candidate profile row update failed:', profErr.message)
      return NextResponse.json({ message: 'השינויים נשמרו, אבל עדכון הפרופיל לשדכנים נכשל. נסו שוב.' }, { status: 502 })
    }
  }
  return NextResponse.json({ ok: true })
}
