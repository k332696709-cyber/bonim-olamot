import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { allFields, MAX_PHOTO_BYTES, validateField, type RegistrationForm } from '@/constants/registrationForms'
import { registrationToProfileRow } from '@/lib/registration/toProfile'

const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) hits.clear()
  return recent.length > 10
}

/**
 * Validates a Tally-style registration, creates the candidate's login (email + the password
 * they chose) and stores answers + photo in Supabase. The candidate sees only their own
 * registration; the full profile only after the administrator approves it.
 */
export async function handleRegistration(req: NextRequest, form: RegistrationForm) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (limited(ip)) {
    return NextResponse.json({ message: 'נשלחו הרבה הרשמות. נסו שוב מאוחר יותר.' }, { status: 429 })
  }

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  const answers: Record<string, string> = {}
  const fields: Record<string, string> = {}
  for (const f of allFields(form)) {
    if (f.type === 'file') continue
    const v = String(fd.get(f.id) ?? '').trim()
    answers[f.id] = v
    const err = validateField(f, v)
    if (err) fields[f.id] = err
  }

  if (String(fd.get('consent') ?? '') !== '1') fields.consent = 'יש לאשר את ההסכמה'

  const password = String(fd.get('password') ?? '')
  if (password.length < 10 || password.length > 72) fields.password = 'הסיסמה חייבת להכיל לפחות 10 תווים'

  const photo = fd.get('photo')
  if (!(photo instanceof File) || photo.size === 0) fields.photo = 'שדה חובה'
  else if (!photo.type.startsWith('image/')) fields.photo = 'יש לבחור קובץ תמונה'
  else if (photo.size > MAX_PHOTO_BYTES) fields.photo = 'הקובץ גדול מדי (עד 10 מגה-בייט)'

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields }, { status: 422 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !serviceKey) {
    console.error('registration: Supabase is not fully configured (service role missing?)')
    return NextResponse.json({ message: 'השירות אינו זמין כרגע. נסו שוב מאוחר יותר.' }, { status: 503 })
  }

  const table = `${form.gender}_registrations`
  const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const email = answers.email.toLowerCase()
  let userId: string | null = null
  let path: string | null = null

  try {
    // 1. The candidate's login.
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role_requested: 'candidate', gender: form.gender },
    })
    if (userErr || !created?.user) {
      const exists = /already|registered|exists/i.test(userErr?.message ?? '')
      if (!exists) console.error('registration: createUser failed', userErr?.message)
      return NextResponse.json(
        exists
          ? { message: 'כבר קיים חשבון עם כתובת המייל הזו. אפשר להיכנס דרך "כניסה".', fields: { email: 'כתובת המייל כבר רשומה' } }
          : { message: 'יצירת החשבון נכשלה. נסו שוב.' },
        { status: exists ? 409 : 502 },
      )
    }
    userId = created.user.id

    // 2. Photo + registration row.
    const supabase = createClient()
    const file = photo as File
    const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
    path = `${form.gender}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('registration-photos')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (upErr) {
      console.error('registration photo upload failed:', upErr.message)
      path = null
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ message: 'העלאת התמונה נכשלה. נסו שוב.' }, { status: 502 })
    }

    // These tables are not in the generated Database types.
    const stored = { ...answers, consentAt: new Date().toISOString(), consentVersion: '2026-11' }
    // Service role: the public (anon) role has no SELECT policy, so INSERT ... RETURNING fails under RLS.
    const { data: reg, error } = await (admin as any)
      .from(table)
      .insert({ answers: stored, photo_path: path, user_id: userId })
      .select('id')
      .single()
    if (error || !reg) {
      console.error(`${table} insert failed:`, error?.message)
      await supabase.storage.from('registration-photos').remove([path])
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ message: 'שמירת השאלון נכשלה. נסו שוב.' }, { status: 502 })
    }

    // The profile is created right away: the candidate sees it at once and matchmakers can
    // work with it. Only the photo waits for the administrator's review.
    const profileRow = { ...registrationToProfileRow(form.gender, answers, path), matchmaker_status: 'bright_red' }
    const { data: profile, error: profErr } = await (admin as any).from('profiles').insert(profileRow).select('id').single()
    if (profErr || !profile) {
      console.error('registration: profile creation failed', profErr?.message)
      await (admin as any).from(table).delete().eq('id', reg.id)
      await admin.storage.from('registration-photos').remove([path])
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ message: 'שמירת הפרופיל נכשלה. נסו שוב.' }, { status: 502 })
    }
    await (admin as any).from(table).update({ profile_id: profile.id }).eq('id', reg.id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`${table} error:`, e)
    if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {})
    return NextResponse.json({ message: 'אירעה שגיאה. נסו שוב.' }, { status: 500 })
  }
}
