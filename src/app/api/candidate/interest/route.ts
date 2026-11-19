import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'
import { notifyOwner } from '@/lib/server/notify'
import { notifyCandidate } from '@/lib/server/candidateNotify'
import { PASS_REASON_CODES } from '@/constants/passReasons'

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

  let body: { to?: string; kind?: string; reason?: string; note?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const to = String(body.to ?? '')
  const kind = body.kind === 'passed' ? 'passed' : body.kind === 'interested' ? 'interested' : null
  if (!kind || !/^[0-9a-f-]{36}$/i.test(to)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  // "Not now" needs a reason (and a few words when the reason is "other"), so the assistant can learn.
  const reason = kind === 'passed' ? String(body.reason ?? '') : ''
  const note = kind === 'passed' ? String(body.note ?? '').trim().slice(0, 300) : ''
  if (kind === 'passed') {
    if (!PASS_REASON_CODES.includes(reason)) return NextResponse.json({ message: 'נא לבחור סיבה.' }, { status: 422 })
    if (reason === 'other' && note.length < 2) return NextResponse.json({ message: 'נא לכתוב למה זה לא מתאים.' }, { status: 422 })
  }

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

  // Only a new "interested" counts as news (a second click does not send everything again).
  const { data: before } = await admin
    .from('match_interests').select('kind').eq('from_profile_id', me).eq('to_profile_id', to).maybeSingle()
  const { error } = await admin
    .from('match_interests')
    .upsert(
      { from_profile_id: me, to_profile_id: to, kind, reason: reason || null, reason_note: note || null },
      { onConflict: 'from_profile_id,to_profile_id' },
    )
  if (error) {
    console.error('interest save failed:', error.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  let mutual = false
  if (kind === 'interested') {
    const { data: back } = await admin
      .from('match_interests').select('id').eq('from_profile_id', to).eq('to_profile_id', me).eq('kind', 'interested').maybeSingle()
    mutual = !!back
    const isNew = before?.kind !== 'interested'
    const { data: mine } = await admin.from('profiles').select('first_name, last_name, city').eq('id', me).maybeSingle()
    const { data: theirs } = await admin.from('profiles').select('first_name, last_name, city').eq('id', to).maybeSingle()
    const nameOf = (x: any) => `${x?.first_name ?? ''} ${x?.last_name ?? ''}`.trim() + (x?.city ? ` (${x.city})` : '')

    if (mutual) {
      // The match opens by itself, so it shows at once under "proposals I received" for both. A
      // matchmaker then takes it over and sets the fee.
      const femaleId = found.gender === 'female' ? me : to
      const maleId = found.gender === 'male' ? me : to
      const { data: existing } = await admin.from('matches').select('id').eq('female_id', femaleId).eq('male_id', maleId).maybeSingle()
      if (!existing) {
        const { error: mErr } = await admin.from('matches').insert({ female_id: femaleId, male_id: maleId })
        if (mErr) console.error('auto match failed:', mErr.message)
      }
      if (isNew) {
        await notifyOwner(
          'עניין הדדי בין שני מועמדים',
          [`${nameOf(mine)} ו${nameOf(theirs)}`, 'שניהם סימנו עניין. השידוך נפתח ומחכה לשדכן/ית שייקח/תיקח אותו.'],
          '/he/matchmaker',
        )
        await Promise.all([notifyCandidate(admin, me, 'mutual'), notifyCandidate(admin, to, 'mutual')])
      }
    } else if (isNew) {
      await notifyOwner(
        'מועמד/ת הביע/ה עניין',
        [`${nameOf(mine)} מעוניין/ת ב${nameOf(theirs)}`, 'הצד השני עדיין לא ענה.'],
        '/he/matchmaker',
      )
      // The other side hears that someone is interested, without being told who.
      await notifyCandidate(admin, to, 'interestReceived')
    }
  }
  return NextResponse.json({ ok: true, state: kind === 'passed' ? 'passed' : mutual ? 'mutual' : 'interested' })
}
