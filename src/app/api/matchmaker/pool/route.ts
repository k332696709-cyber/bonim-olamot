import { NextRequest, NextResponse } from 'next/server'
import { MALE_FORM, FEMALE_FORM, registerFields, isFieldVisible, validateField, MAX_PHOTOS, MAX_PHOTO_BYTES } from '@/constants/registrationForms'
import { withDerivedAge } from '@/lib/registration/birthDate'
import { HASIDIC } from '@/constants/communityLists'
import { ownEntry, PHOTO_BUCKET, poolOwner } from '@/lib/server/pool'

export const runtime = 'nodejs'

const ENTERED_BY = ['אני בעצמי', 'קרוב/ה של המועמד/ת', 'אחר']

/** The matchmaker's own pool, and nobody else's. */
export async function GET(req: NextRequest) {
  const who = await poolOwner(req)
  if ('error' in who) return who.error
  const { admin, mm } = who

  const { data } = await admin.from('matchmaker_pool').select('*').eq('matchmaker_id', mm.id).order('created_at', { ascending: false })
  const entries = await Promise.all((data ?? []).map(async (e: any) => {
    const a = e.answers ?? {}
    let photoUrl: string | null = null
    if (e.photo_paths?.[0]) {
      const { data: signed } = await admin.storage.from(PHOTO_BUCKET).createSignedUrl(e.photo_paths[0], 3600)
      photoUrl = signed?.signedUrl ?? null
    }
    return {
      id: e.id,
      gender: e.gender,
      name: `${a.fullName ?? ''} ${a.lastName ?? ''}`.trim(),
      age: Number(a.age) || null,
      city: a.city ?? '',
      community: a.community ?? '',
      enteredBy: e.entered_by ?? '',
      notes: a.poolNotes ?? '',
      photoUrl,
      inMatch: !!e.profile_id,
      createdAt: e.created_at,
    }
  }))
  return NextResponse.json({ entries })
}

/** Adds a candidate to the pool. Same short form as the site registration, no account. */
export async function POST(req: NextRequest) {
  const who = await poolOwner(req)
  if ('error' in who) return who.error
  const { admin, mm } = who

  const gender = new URL(req.url).searchParams.get('gender')
  if (gender !== 'male' && gender !== 'female') return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  let fd: FormData
  try { fd = await req.formData() } catch { return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 }) }

  const form = gender === 'male' ? MALE_FORM : FEMALE_FORM
  const answers: Record<string, string> = {}
  const fields: Record<string, string> = {}
  const asked = registerFields(form).filter((f) => f.type !== 'file')
  for (const f of asked) answers[f.id] = String(fd.get(f.id) ?? '').trim()
  for (const f of asked) {
    if (!isFieldVisible(f, answers)) { answers[f.id] = ''; continue }
    // A candidate kept for later may have no email yet.
    const err = validateField(f.id === 'email' ? { ...f, required: false } : f, answers[f.id])
    if (err) fields[f.id] = err
  }
  withDerivedAge(answers)
  if (!(answers.community ?? '').includes(HASIDIC)) answers.hasidut = ''

  const enteredBy = String(fd.get('enteredBy') ?? '').trim()
  if (!ENTERED_BY.includes(enteredBy)) fields.enteredBy = 'שדה חובה'
  answers.poolNotes = String(fd.get('poolNotes') ?? '').trim().slice(0, 2000)

  const photos = fd.getAll('photo').filter((x): x is File => x instanceof File && x.size > 0)
  if (photos.length > MAX_PHOTOS) fields.photo = `אפשר להעלות עד ${MAX_PHOTOS} תמונות`
  else if (photos.some((x) => !x.type.startsWith('image/'))) fields.photo = 'יש לבחור קבצי תמונה'
  else if (photos.some((x) => x.size > MAX_PHOTO_BYTES)) fields.photo = 'קובץ גדול מדי'

  if (Object.keys(fields).length > 0) return NextResponse.json({ message: 'יש שדות שדורשים תיקון.', fields }, { status: 422 })

  const paths: string[] = []
  for (const file of photos) {
    const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
    const p = `pool/${mm.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const { error } = await admin.storage.from(PHOTO_BUCKET).upload(p, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (error) {
      console.error('pool photo upload failed:', error.message)
      if (paths.length) await admin.storage.from(PHOTO_BUCKET).remove(paths)
      return NextResponse.json({ message: 'העלאת התמונה נכשלה. נסו שוב.' }, { status: 502 })
    }
    paths.push(p)
  }

  const { data: row, error } = await admin
    .from('matchmaker_pool')
    .insert({ matchmaker_id: mm.id, gender, answers, photo_paths: paths, entered_by: enteredBy })
    .select('id').single()
  if (error || !row) {
    console.error('pool insert failed:', error?.message)
    if (paths.length) await admin.storage.from(PHOTO_BUCKET).remove(paths)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, id: row.id })
}

/** Removes one of the matchmaker's own entries (not one that is in a match). */
export async function DELETE(req: NextRequest) {
  const who = await poolOwner(req)
  if ('error' in who) return who.error
  const { admin, mm } = who
  const entry = await ownEntry(admin, mm.id, new URL(req.url).searchParams.get('id') ?? '')
  if (!entry) return NextResponse.json({ message: 'לא נמצא.' }, { status: 404 })
  if (entry.profile_id) return NextResponse.json({ message: 'הוא/היא באמצע שידוך, ולכן אי אפשר למחוק עכשיו.' }, { status: 409 })
  if (entry.photo_paths?.length) await admin.storage.from(PHOTO_BUCKET).remove(entry.photo_paths)
  await admin.from('matchmaker_pool').delete().eq('id', entry.id)
  return NextResponse.json({ ok: true })
}
