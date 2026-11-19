import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

async function staff(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: mm } = await admin.from('matchmakers').select('id').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return { error: NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 }) }
  return { admin }
}

/** All announcements for the dashboard: the ones waiting for approval first. */
export async function GET(req: NextRequest) {
  const s = await staff(req)
  if ('error' in s) return s.error
  const { data } = await s.admin.from('engagements').select('*').order('created_at', { ascending: false }).limit(100)
  const rows = (data ?? []).slice().sort((a: any, b: any) => Number(b.status === 'pending') - Number(a.status === 'pending'))
  return NextResponse.json({ engagements: rows })
}

const EDITABLE = ['groom_name', 'groom_father', 'groom_community', 'groom_city', 'bride_name', 'bride_father', 'bride_community', 'bride_city']

/** Approve, hide, edit or delete one announcement. Body: { id, status? , delete?, fields? }. */
export async function PATCH(req: NextRequest) {
  const s = await staff(req)
  if ('error' in s) return s.error
  let body: { id?: string; status?: string; delete?: boolean; fields?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const id = String(body.id ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  if (body.delete) {
    const { error } = await s.admin.from('engagements').delete().eq('id', id)
    if (error) return NextResponse.json({ message: 'המחיקה נכשלה.' }, { status: 502 })
    return NextResponse.json({ ok: true })
  }

  const update: Record<string, unknown> = {}
  if (body.status === 'pending' || body.status === 'published' || body.status === 'hidden') update.status = body.status
  for (const k of EDITABLE) {
    if (!body.fields || !(k in body.fields)) continue
    const v = String(body.fields[k] ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 80)
    // The two names are required; the other details may be emptied.
    if (k.endsWith('_name')) { if (v) update[k] = v } else update[k] = v || null
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ message: 'אין מה לעדכן.' }, { status: 400 })
  const { error } = await s.admin.from('engagements').update(update).eq('id', id)
  if (error) return NextResponse.json({ message: 'העדכון נכשל.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
