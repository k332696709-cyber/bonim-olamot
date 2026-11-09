import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ALL_MALE_FIELDS, MAX_PHOTO_BYTES, validateField } from '@/constants/maleTallyForm'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }

  // Validate every answer with the same rules the form uses.
  const answers: Record<string, string> = {}
  const fields: Record<string, string> = {}
  for (const f of ALL_MALE_FIELDS) {
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

  try {
    const supabase = createClient()
    const file = photo as File
    const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
    const path = `male/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('registration-photos')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (upErr) {
      console.error('registration photo upload failed:', upErr.message)
      return NextResponse.json({ message: 'העלאת התמונה נכשלה. נסו שוב.' }, { status: 502 })
    }

    // male_registrations is not in the generated Database types yet
    const { error } = await (supabase as any).from('male_registrations').insert({ answers, photo_path: path })
    if (error) {
      console.error('male registration insert failed:', error.message)
      await supabase.storage.from('registration-photos').remove([path])
      return NextResponse.json({ message: 'שמירת השאלון נכשלה. נסו שוב.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('male registration error:', e)
    return NextResponse.json({ message: 'אירעה שגיאה. נסו שוב.' }, { status: 500 })
  }
}
