import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'
import { notifyOwner } from '@/lib/server/notify'

export const runtime = 'nodejs'

/**
 * The candidate says "interested" or "not now" about a proposal. When the other side is already
 * interested, the result is mutual and the owner is told so a matchmaker can step in.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { to?: string; kind?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const to = String(body.to ?? '')
  const kind = body.kind === 'passed' ? 'passed' : body.kind === 'interested' ? 'interested' : null
  if (!kind || !/^[0-9a-f-]{36}$/i.test(to)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const found = await findRegistration(admin, caller.user.id)
  const me = found?.reg.profile_id
  if (!found || !me) return NextResponse.json({ message: 'ההרשמה עדיין ממתינה לאישור.' }, { status: 403 })
  if (me === to) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  // Only the opposite gender can be proposed.
  const { data: target } = await admin.from('profiles').select('id, gender, first_name').eq('id', to).maybeSingle()
  if (!target || target.gender === found.gender) return NextResponse.json({ message: 'ההצעה לא נמצאה.' }, { status: 404 })

  const { error } = await admin
    .from('match_interests')
    .upsert({ from_profile_id: me, to_profile_id: to, kind }, { onConflict: 'from_profile_id,to_profile_id' })
  if (error) {
    console.error('interest save failed:', error.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  let mutual = false
  if (kind === 'interested') {
    const { data: back } = await admin
      .from('match_interests').select('id').eq('from_profile_id', to).eq('to_profile_id', me).eq('kind', 'interested').maybeSingle()
    mutual = !!back
    if (mutual) {
      const { data: mine } = await admin.from('profiles').select('first_name').eq('id', me).maybeSingle()
      await notifyOwner(
        'עניין הדדי בין שני מועמדים',
        [`${mine?.first_name ?? ''} ו${target.first_name ?? ''}`, 'שניהם סימנו עניין. אפשר ליצור קשר ולהתחיל תהליך.'],
        '/he/matchmaker',
      )
    }
  }
  return NextResponse.json({ ok: true, state: kind === 'passed' ? 'passed' : mutual ? 'mutual' : 'interested' })
}
