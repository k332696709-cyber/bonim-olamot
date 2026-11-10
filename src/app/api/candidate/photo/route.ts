import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MAX_PHOTO_BYTES } from '@/constants/registrationForms'

export const runtime = 'nodejs'

/**
 * A signed-in candidate replaces their photo (for example after it was not approved).
 * The new photo goes back to "pending" until the administrator reviews it.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const photo = fd.get('photo')
  if (!(photo instanceof File) || photo.size === 0) return NextResponse.json({ message: 'יש לבחור תמונה.' }, { status: 422 })
  if (!photo.type.startsWith('image/')) return NextResponse.json({ message: 'יש לבחור קובץ תמונה.' }, { status: 422 })
  if (photo.size > MAX_PHOTO_BYTES) return NextResponse.json({ message: 'הקובץ גדול מדי (עד 10 מגה-בייט).' }, { status: 422 })

  // The caller's own registration (men's or women's).
  let gender: 'male' | 'female' | null = null
  let reg: any = null
  for (const g of ['male', 'female'] as const) {
    const { data } = await (admin as any).from(`${g}_registrations`).select('id, photo_path, profile_id').eq('user_id', caller.user.id).maybeSingle()
    if (data) { gender = g; reg = data; break }
  }
  if (!reg || !gender) return NextResponse.json({ message: 'לא נמצאה הרשמה.' }, { status: 404 })

  const ext = (photo.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
  const path = `${gender}/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const { error: upErr } = await admin.storage
    .from('registration-photos')
    .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false })
  if (upErr) {
    console.error('candidate photo upload failed:', upErr.message)
    return NextResponse.json({ message: 'העלאת התמונה נכשלה.' }, { status: 502 })
  }

  const { error: updErr } = await (admin as any)
    .from(`${gender}_registrations`)
    .update({ photo_path: path, photo_status: 'pending', photo_reviewed_at: null })
    .eq('id', reg.id)
  if (updErr) {
    console.error('candidate photo update failed:', updErr.message)
    await admin.storage.from('registration-photos').remove([path])
    return NextResponse.json({ message: 'עדכון התמונה נכשל.' }, { status: 502 })
  }
  if (reg.profile_id) await (admin as any).from('profiles').update({ photos: [path] }).eq('id', reg.profile_id)
  if (reg.photo_path) await admin.storage.from('registration-photos').remove([reg.photo_path])

  return NextResponse.json({ ok: true })
}
