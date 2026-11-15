import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

/**
 * The matchmakers' directory: who else works on the site and what they handle, so colleagues can
 * cooperate. It contains NO activity or statistics. Open to any signed-in matchmaker or admin.
 */
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: me } = await admin.from('matchmakers').select('id').eq('user_id', caller.user.id).maybeSingle()
  if (!me) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const { data: rows } = await admin
    .from('matchmakers').select('id, email, first_name, last_name, phone').order('first_name')
  const { data: apps } = await admin
    .from('matchmaker_applications')
    .select('email, city, biography, specialties, languages, years_experience')
    .eq('status', 'approved')
  const byEmail = new Map<string, any>((apps ?? []).map((a: any) => [String(a.email).toLowerCase(), a]))

  const members = (rows ?? []).map((m: any) => {
    const a = byEmail.get(String(m.email).toLowerCase())
    return {
      id: m.id,
      isMe: m.id === me.id,
      name: `${m.first_name} ${m.last_name}`.trim(),
      email: m.email,
      phone: m.phone ?? '',
      city: a?.city ?? '',
      biography: a?.biography ?? '',
      specialties: a?.specialties ?? [],
      languages: a?.languages ?? '',
      yearsExperience: a?.years_experience ?? null,
    }
  })
  return NextResponse.json({ members })
}
