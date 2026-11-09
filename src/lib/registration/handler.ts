import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { allFields, MAX_PHOTO_BYTES, validateField, type RegistrationForm } from '@/constants/registrationForms'

/** Validates a Tally-style registration and stores answers + photo in Supabase. */
export async function handleRegistration(req: NextRequest, form: RegistrationForm) {
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

  const photo = fd.get('photo')
  if (!(photo instanceof File) || photo.size === 0) fields.photo = 'שדה חובה'
  else if (!photo.type.startsWith('image/')) fields.photo = 'יש לבחור קובץ תמונה'
  else if (photo.size > MAX_PHOTO_BYTES) fields.photo = 'הקובץ גדול מדי (עד 10 מגה-בייט)'

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields }, { status: 422 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ message: 'השירות אינו זמין כרגע. נסו שוב מאוחר יותר.' }, { status: 503 })
  }

  const table = `${form.gender}_registrations`
  try {
    const supabase = createClient()
    const file = photo as File
    const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
    const path = `${form.gender}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('registration-photos')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (upErr) {
      console.error('registration photo upload failed:', upErr.message)
      return NextResponse.json({ message: 'העלאת התמונה נכשלה. נסו שוב.' }, { status: 502 })
    }

    // These tables are not in the generated Database types.
    const { error } = await (supabase as any).from(table).insert({ answers, photo_path: path })
    if (error) {
      console.error(`${table} insert failed:`, error.message)
      await supabase.storage.from('registration-photos').remove([path])
      return NextResponse.json({ message: 'שמירת השאלון נכשלה. נסו שוב.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`${table} error:`, e)
    return NextResponse.json({ message: 'אירעה שגיאה. נסו שוב.' }, { status: 500 })
  }
}
