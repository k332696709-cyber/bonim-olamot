import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MAX_PHOTO_BYTES, MIN_AGE, SPECIALTY_VALUES } from '@/constants/matchmakerForm'

export const runtime = 'nodejs'

const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) hits.clear()
  return recent.length > 5
}

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max)

function ageOn(dateStr: string): number | null {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

/**
 * A matchmaker asks to join. We create their login (no access yet: access comes from a
 * matchmakers row) and a pending request. The administrator approves it from the site.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (limited(ip)) {
    return NextResponse.json({ message: 'נשלחו הרבה בקשות. נסו שוב מאוחר יותר.' }, { status: 429 })
  }

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  if (clean(fd.get('website'), 50)) return NextResponse.json({ ok: true }) // honeypot

  const gender = clean(fd.get('gender'), 10)
  const firstName = clean(fd.get('firstName'), 60)
  const lastName = clean(fd.get('lastName'), 60)
  const phone = clean(fd.get('phone'), 20)
  const email = clean(fd.get('email'), 120).toLowerCase()
  const birthDate = clean(fd.get('birthDate'), 10)
  const biography = clean(fd.get('biography'), 1500)
  const years = Number(clean(fd.get('yearsExperience'), 3))
  const matches = Number(clean(fd.get('matchesClosed'), 6))
  const city = clean(fd.get('city'), 80)
  const languages = clean(fd.get('languages'), 150)
  const password = String(fd.get('password') ?? '')
  const specialties = fd.getAll('specialties').map(String).filter((s) => SPECIALTY_VALUES.includes(s))
  const photo = fd.get('photo')
  const consent = clean(fd.get('consent'), 2) === '1'

  const fields: Record<string, string> = {}
  if (gender !== 'male' && gender !== 'female') fields.gender = 'יש לבחור שדכן או שדכנית'
  if (firstName.length < 2) fields.firstName = 'שדה חובה'
  if (lastName.length < 2) fields.lastName = 'שדה חובה'
  if (!/^05\d{8}$/.test(phone)) fields.phone = 'מספר טלפון לא תקין (05XXXXXXXX)'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'כתובת מייל לא תקינה'
  const age = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? ageOn(birthDate) : null
  if (age === null) fields.birthDate = 'יש לבחור תאריך לידה'
  else if (age < MIN_AGE || age > 100) fields.birthDate = `גיל מינימלי: ${MIN_AGE}`
  if (biography.length < 10) fields.biography = 'נא לכתוב כמה מילים על עצמך'
  if (!/^\d{1,2}$/.test(clean(fd.get('yearsExperience'), 3)) || years > 80) fields.yearsExperience = 'יש להזין מספר'
  if (!/^\d{1,6}$/.test(clean(fd.get('matchesClosed'), 6))) fields.matchesClosed = 'יש להזין מספר'
  if (city.length < 2) fields.city = 'שדה חובה'
  if (specialties.length === 0) fields.specialties = 'יש לבחור לפחות תחום אחד'
  if (languages.length < 2) fields.languages = 'שדה חובה'
  if (!consent) fields.consent = 'יש לאשר את ההסכמה'
  if (password.length < 10 || password.length > 72) fields.password = 'הסיסמה חייבת להכיל לפחות 10 תווים'

  let photoFile: File | null = null
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith('image/')) fields.photo = 'יש לבחור קובץ תמונה'
    else if (photo.size > MAX_PHOTO_BYTES) fields.photo = 'הקובץ גדול מדי (עד 10 מגה-בייט)'
    else photoFile = photo
  }

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields }, { status: 422 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('matchmaker registration: Supabase service role is not configured')
    return NextResponse.json({ message: 'ההרשמה אינה זמינה כרגע.' }, { status: 503 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const taken = { message: 'כבר קיימת בקשה או חשבון עם כתובת המייל הזו.', fields: { email: 'כתובת המייל כבר רשומה' } }

  let userId: string | null = null
  let photoPath: string | null = null
  try {
    const { data: existingMm } = await admin.from('matchmakers').select('id').eq('email', email).maybeSingle()
    const { data: existingApp } = await (admin as any).from('matchmaker_applications').select('id').eq('email', email).maybeSingle()
    if (existingMm || existingApp) return NextResponse.json(taken, { status: 409 })

    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role_requested: 'matchmaker' },
    })
    if (userErr || !created?.user) {
      const exists = /already|registered|exists/i.test(userErr?.message ?? '')
      if (!exists) console.error('matchmaker registration: createUser failed', userErr?.message)
      return NextResponse.json(exists ? taken : { message: 'יצירת החשבון נכשלה. נסו שוב.' }, { status: exists ? 409 : 502 })
    }
    userId = created.user.id

    if (photoFile) {
      const ext = (photoFile.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
      photoPath = `matchmaker/${Date.now()}-${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await admin.storage
        .from('registration-photos')
        .upload(photoPath, Buffer.from(await photoFile.arrayBuffer()), { contentType: photoFile.type, upsert: false })
      if (upErr) {
        console.error('matchmaker registration: photo upload failed', upErr.message)
        photoPath = null
        await admin.auth.admin.deleteUser(userId)
        return NextResponse.json({ message: 'העלאת התמונה נכשלה. נסו שוב.' }, { status: 502 })
      }
    }

    const { error: appErr } = await (admin as any).from('matchmaker_applications').insert({
      user_id: userId,
      email,
      gender,
      first_name: firstName,
      last_name: lastName,
      phone,
      birth_date: birthDate,
      photo_path: photoPath,
      biography,
      years_experience: Math.round(years),
      matches_closed: Math.round(matches),
      city,
      specialties,
      languages,
    })
    if (appErr) {
      console.error('matchmaker registration: insert failed', appErr.message)
      if (photoPath) await admin.storage.from('registration-photos').remove([photoPath])
      await admin.auth.admin.deleteUser(userId) // roll back so the email is not stuck
      return NextResponse.json({ message: 'שמירת הבקשה נכשלה. נסו שוב.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('matchmaker registration error:', e)
    if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {})
    return NextResponse.json({ message: 'אירעה שגיאה. נסו שוב.' }, { status: 500 })
  }
}
