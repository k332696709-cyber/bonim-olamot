import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FEMALE_FORM, MALE_FORM, isFieldVisible, questionnairePages, validateField } from '@/constants/registrationForms'
import { HASIDIC } from '@/constants/communityLists'
import { findRegistration } from '@/lib/server/photos'
import { saveProfileFromRegistration } from '@/lib/server/profileFromRegistration'
import { notifyOwner } from '@/lib/server/notify'
import { questionnaireProgress } from '@/lib/registration/completion'

export const runtime = 'nodejs'

/**
 * Saves the questionnaire answers a signed-in candidate has filled in so far (any part of it; the
 * form saves as the person moves between steps). Nothing is required at this point: the questions
 * just add up to a percentage. When it reaches 100% the profile is created and matchmakers can see it.
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
  const fields = questionnairePages(form).flatMap((p) => p.fields)
  const existing: Record<string, string> = found.reg.answers ?? {}
  const updates: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const f of fields) {
    if (!fd.has(f.id)) continue
    const v = String(fd.get(f.id) ?? '').trim()
    // Only the format is checked here; whether a question is required matters for the 100%.
    const err = validateField({ ...f, required: false }, v)
    if (err) errors[f.id] = err
    else updates[f.id] = v
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields: errors }, { status: 422 })
  }

  const merged: Record<string, string> = { ...existing, ...updates }
  for (const f of fields) if (!isFieldVisible(f, merged)) merged[f.id] = ''
  if (!(merged.community ?? '').includes(HASIDIC)) merged.hasidut = ''
  merged.updatedAt = new Date().toISOString()

  const { error: updErr } = await admin.from(found.table).update({ answers: merged }).eq('id', found.reg.id)
  if (updErr) {
    console.error('questionnaire save failed:', updErr.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  const progress = questionnaireProgress(form, merged)
  const wasComplete = !!found.reg.profile_id
  let complete = wasComplete

  // At 100% the profile appears for matchmakers; later edits refresh it.
  if (progress.percent >= 100 || wasComplete) {
    const id = await saveProfileFromRegistration(admin, found, caller.user.id, merged)
    if (!id) return NextResponse.json({ message: 'השאלון נשמר, אבל יצירת הפרופיל נכשלה. נסו שוב.' }, { status: 502 })
    complete = true
    if (!wasComplete) {
      await notifyOwner(
        found.gender === 'male' ? 'מיועד השלים את השאלון' : 'מיועדת השלימה את השאלון',
        [`שם: ${merged.fullName ?? ''}`, `גיל: ${merged.age ?? ''}`, `עיר: ${merged.city ?? ''}`],
        '/he/matchmaker/registrations',
      )
    }
  }

  return NextResponse.json({ ok: true, percent: progress.percent, complete, steps: progress.steps })
}
