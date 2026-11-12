import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MAX_PHOTO_BYTES } from '@/constants/registrationForms'
import { findRegistration, MAX_SLOTS, PHOTO_BUCKET, photoExtension, syncCandidatePhotos } from '@/lib/server/photos'

export const runtime = 'nodejs'

async function authed(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const found = await findRegistration(admin, caller.user.id)
  if (!found) return { error: NextResponse.json({ message: 'לא נמצאה הרשמה.' }, { status: 404 }) }
  return { admin, userId: caller.user.id as string, found }
}

const validSlot = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) < MAX_SLOTS

/**
 * A signed-in candidate puts a photo into one of their five slots (adds or replaces).
 * The photo starts as "pending" until the administrator reviews it.
 */
export async function POST(req: NextRequest) {
  const a = await authed(req)
  if ('error' in a) return a.error
  const { admin, userId, found } = a

  let fd: FormData
  try {
    fd = await req.formData()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const slot = Number(fd.get('slot'))
  const photo = fd.get('photo')
  if (!validSlot(slot)) return NextResponse.json({ message: 'מקום לתמונה לא תקין.' }, { status: 422 })
  if (!(photo instanceof File) || photo.size === 0) return NextResponse.json({ message: 'יש לבחור תמונה.' }, { status: 422 })
  if (!photo.type.startsWith('image/')) return NextResponse.json({ message: 'יש לבחור קובץ תמונה.' }, { status: 422 })
  if (photo.size > MAX_PHOTO_BYTES) return NextResponse.json({ message: 'הקובץ גדול מדי (עד 10 מגה-בייט).' }, { status: 422 })

  const path = `${found.gender}/${Date.now()}-${crypto.randomUUID()}.${photoExtension(photo.name)}`
  const { error: upErr } = await admin.storage
    .from(PHOTO_BUCKET)
    .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false })
  if (upErr) {
    console.error('candidate photo upload failed:', upErr.message)
    return NextResponse.json({ message: 'העלאת התמונה נכשלה.' }, { status: 502 })
  }

  const { data: old } = await admin.from('candidate_photos').select('id, path').eq('user_id', userId).eq('position', slot).maybeSingle()
  const row = { path, status: 'pending', reviewed_at: null }
  const { error: dbErr } = old
    ? await admin.from('candidate_photos').update(row).eq('id', old.id)
    : await admin.from('candidate_photos').insert({ ...row, user_id: userId, gender: found.gender, position: slot })
  if (dbErr) {
    console.error('candidate photo row failed:', dbErr.message)
    await admin.storage.from(PHOTO_BUCKET).remove([path])
    return NextResponse.json({ message: 'שמירת התמונה נכשלה.' }, { status: 502 })
  }
  if (old?.path) await admin.storage.from(PHOTO_BUCKET).remove([old.path])
  await ensureMain(admin, userId)
  await syncCandidatePhotos(admin, userId)
  return NextResponse.json({ ok: true })
}

/** Whoever has photos has exactly one main photo; if none is flagged, the lowest box becomes main. */
async function ensureMain(admin: any, userId: string) {
  const { data: rows } = await admin.from('candidate_photos').select('id, position, is_main').eq('user_id', userId).order('position')
  if (!rows || rows.length === 0 || rows.some((r: any) => r.is_main)) return
  await admin.from('candidate_photos').update({ is_main: true }).eq('id', rows[0].id)
}

/** The candidate chooses which of their photos is the main one. */
export async function PATCH(req: NextRequest) {
  const a = await authed(req)
  if ('error' in a) return a.error
  const { admin, userId } = a

  let body: { slot?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  if (!validSlot(body.slot)) return NextResponse.json({ message: 'מקום לתמונה לא תקין.' }, { status: 422 })

  const { data: target } = await admin.from('candidate_photos').select('id').eq('user_id', userId).eq('position', body.slot).maybeSingle()
  if (!target) return NextResponse.json({ message: 'אין תמונה במקום הזה.' }, { status: 404 })

  // Only one main photo per person: clear the old flag first.
  await admin.from('candidate_photos').update({ is_main: false }).eq('user_id', userId).eq('is_main', true)
  const { error } = await admin.from('candidate_photos').update({ is_main: true }).eq('id', target.id)
  if (error) {
    await ensureMain(admin, userId)
    return NextResponse.json({ message: 'עדכון התמונה הראשית נכשל.' }, { status: 502 })
  }
  await syncCandidatePhotos(admin, userId)
  return NextResponse.json({ ok: true })
}

/** Removes the photo in one slot. At least one photo must stay. */
export async function DELETE(req: NextRequest) {
  const a = await authed(req)
  if ('error' in a) return a.error
  const { admin, userId } = a

  let body: { slot?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  if (!validSlot(body.slot)) return NextResponse.json({ message: 'מקום לתמונה לא תקין.' }, { status: 422 })

  const { data: rows } = await admin.from('candidate_photos').select('id, path, position').eq('user_id', userId)
  const target = (rows ?? []).find((r: any) => r.position === body.slot)
  if (!target) return NextResponse.json({ ok: true })
  if ((rows ?? []).length <= 1) return NextResponse.json({ message: 'חובה להשאיר לפחות תמונה אחת.' }, { status: 422 })

  await admin.from('candidate_photos').delete().eq('id', target.id)
  await admin.storage.from(PHOTO_BUCKET).remove([target.path])
  await ensureMain(admin, userId)
  await syncCandidatePhotos(admin, userId)
  return NextResponse.json({ ok: true })
}
