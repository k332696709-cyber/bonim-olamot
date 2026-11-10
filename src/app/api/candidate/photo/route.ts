import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MAX_PHOTO_BYTES, MAX_PHOTOS } from '@/constants/registrationForms'

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
  const photos = fd.getAll('photo').filter((x): x is File => x instanceof File && x.size > 0)
  if (photos.length === 0) return NextResponse.json({ message: 'יש לבחור תמונה.' }, { status: 422 })
  if (photos.length > MAX_PHOTOS) return NextResponse.json({ message: `אפשר להעלות עד ${MAX_PHOTOS} תמונות.` }, { status: 422 })
  if (photos.some((x) => !x.type.startsWith('image/'))) return NextResponse.json({ message: 'יש לבחור קבצי תמונה.' }, { status: 422 })
  if (photos.some((x) => x.size > MAX_PHOTO_BYTES)) return NextResponse.json({ message: 'קובץ גדול מדי (עד 10 מגה-בייט לתמונה).' }, { status: 422 })

  // The caller's own registration (men's or women's).
  let gender: 'male' | 'female' | null = null
  let reg: any = null
  for (const g of ['male', 'female'] as const) {
    const { data } = await (admin as any).from(`${g}_registrations`).select('id, photo_path, extra_photo_paths, profile_id').eq('user_id', caller.user.id).maybeSingle()
    if (data) { gender = g; reg = data; break }
  }
  if (!reg || !gender) return NextResponse.json({ message: 'לא נמצאה הרשמה.' }, { status: 404 })

  const paths: string[] = []
  for (const photo of photos) {
    const ext = (photo.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
    const path = `${gender}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await admin.storage
      .from('registration-photos')
      .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false })
    if (upErr) {
      console.error('candidate photo upload failed:', upErr.message)
      if (paths.length) await admin.storage.from('registration-photos').remove(paths)
      return NextResponse.json({ message: 'העלאת התמונה נכשלה.' }, { status: 502 })
    }
    paths.push(path)
  }

  const { error: updErr } = await (admin as any)
    .from(`${gender}_registrations`)
    .update({ photo_path: paths[0], extra_photo_paths: paths.slice(1), photo_status: 'pending', photo_reviewed_at: null })
    .eq('id', reg.id)
  if (updErr) {
    console.error('candidate photo update failed:', updErr.message)
    await admin.storage.from('registration-photos').remove(paths)
    return NextResponse.json({ message: 'עדכון התמונות נכשל.' }, { status: 502 })
  }
  if (reg.profile_id) await (admin as any).from('profiles').update({ photos: paths }).eq('id', reg.profile_id)
  const old = [reg.photo_path, ...(reg.extra_photo_paths ?? [])].filter(Boolean)
  if (old.length) await admin.storage.from('registration-photos').remove(old)

  return NextResponse.json({ ok: true })
}
