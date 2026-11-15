import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/server/notify'

export const runtime = 'nodejs'

const FEE_MIN = 5000
const FEE_MAX = 10000

/**
 * A matchmaker opens a match (or updates an existing one) and sets the matchmaking fee. The
 * amount is sent to both candidates by email and shown in their personal area, where each
 * confirms they saw it. Sending the amount again resets both confirmations.
 *
 * Body: { amount, matchId } for an existing match, or { amount, femaleId, maleId } to open one.
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { amount?: unknown; matchId?: unknown; femaleId?: unknown; maleId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const amount = Number(body.amount)
  if (!Number.isInteger(amount) || amount < FEE_MIN || amount > FEE_MAX) {
    return NextResponse.json({ message: `הסכום חייב להיות בין ${FEE_MIN.toLocaleString('he-IL')} ל-${FEE_MAX.toLocaleString('he-IL')} ש"ח.` }, { status: 422 })
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin
    .from('matchmakers').select('id, first_name, last_name, is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm) return NextResponse.json({ message: 'הפעולה פתוחה לשדכנים בלבד.' }, { status: 403 })

  const uuid = /^[0-9a-f-]{36}$/i
  let match: any = null

  if (body.matchId) {
    if (!uuid.test(String(body.matchId))) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
    const { data } = await admin.from('matches').select('*').eq('id', String(body.matchId)).maybeSingle()
    match = data
    if (!match) return NextResponse.json({ message: 'השידוך לא נמצא.' }, { status: 404 })
  } else {
    const femaleId = String(body.femaleId ?? '')
    const maleId = String(body.maleId ?? '')
    if (!uuid.test(femaleId) || !uuid.test(maleId)) return NextResponse.json({ message: 'יש לבחור מיועדת ומיועד.' }, { status: 422 })
    const { data: pair } = await admin.from('profiles').select('id, gender').in('id', [femaleId, maleId])
    const female = (pair ?? []).find((p: any) => p.id === femaleId)
    const male = (pair ?? []).find((p: any) => p.id === maleId)
    if (!female || !male || female.gender !== 'female' || male.gender !== 'male') {
      return NextResponse.json({ message: 'יש לבחור מיועדת ומיועד.' }, { status: 422 })
    }
    const { data: existing } = await admin.from('matches').select('*').eq('female_id', femaleId).eq('male_id', maleId).maybeSingle()
    if (existing) {
      match = existing
    } else {
      const { data: created, error } = await admin
        .from('matches').insert({ female_id: femaleId, male_id: maleId, matchmaker_id: mm.id }).select('*').single()
      if (error || !created) {
        console.error('match create failed:', error?.message)
        return NextResponse.json({ message: 'פתיחת השידוך נכשלה. נסו שוב.' }, { status: 502 })
      }
      match = created
    }
  }

  // Only the matchmaker who handles the match (or the administrator) may set its fee.
  if (!mm.is_admin && match.matchmaker_id !== mm.id) {
    return NextResponse.json({ message: 'השידוך הזה מטופל על ידי שדכן/ית אחר/ת.' }, { status: 403 })
  }

  const now = new Date().toISOString()
  const { data: saved, error: updErr } = await admin
    .from('matches')
    .update({
      fee_amount: amount,
      fee_sent_at: now,
      fee_female_ack_at: null,
      fee_male_ack_at: null,
      matchmaker_id: match.matchmaker_id ?? mm.id,
      updated_at: now,
    })
    .eq('id', match.id)
    .select('*')
    .single()
  if (updErr || !saved) {
    console.error('match fee save failed:', updErr?.message)
    return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 })
  }

  // Tell both candidates (their login email), without naming the other side.
  const { data: people } = await admin.from('profiles').select('id, email').in('id', [saved.female_id, saved.male_id])
  const who = `${mm.first_name ?? ''} ${mm.last_name ?? ''}`.trim()
  const money = `${amount.toLocaleString('he-IL')} ש"ח`
  let emailed = 0
  for (const p of people ?? []) {
    const ok = await sendMail(
      p.email,
      'עדכון בנושא דמי שידוך',
      [
        `${who || 'השדכן/ית המטפל/ת'} עדכן/ה את סכום דמי השידוך להצעה שלך: ${money}.`,
        'הסכום משולם רק לאחר סגירת האירוסין, ולא בשלבים קודמים.',
        'נא להיכנס לאזור האישי כדי לראות ולאשר שקראת.',
      ],
      '/he/personal',
    )
    if (ok) emailed++
  }

  return NextResponse.json({
    ok: true,
    emailed,
    match: {
      id: saved.id,
      femaleId: saved.female_id,
      maleId: saved.male_id,
      stage: saved.stage,
      feeAmount: saved.fee_amount,
      feeSentAt: saved.fee_sent_at,
      femaleAck: !!saved.fee_female_ack_at,
      maleAck: !!saved.fee_male_ack_at,
      matchmakerId: saved.matchmaker_id,
      updatedAt: saved.updated_at,
    },
  })
}
