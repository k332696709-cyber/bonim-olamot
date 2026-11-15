import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'

export const runtime = 'nodejs'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) as any
}

const uuid = /^[0-9a-f-]{36}$/i

/**
 * A registered candidate writes (or updates) a review of a date spot. One review per person per
 * place. The author appears only as "בחור" or "בחורה".
 * Body: { spotId, rating (1-5), text }
 */
export async function POST(req: NextRequest) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'כדי לכתוב ביקורת יש להתחבר.' }, { status: 401 })
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'כדי לכתוב ביקורת יש להתחבר.' }, { status: 401 })

  let body: { spotId?: unknown; rating?: unknown; text?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const spotId = String(body.spotId ?? '')
  const rating = Number(body.rating)
  const text = String(body.text ?? '').replace(/\r/g, '').trim()
  if (!uuid.test(spotId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ message: 'יש לבחור דירוג בכוכבים.' }, { status: 422 })
  if (text.length < 3) return NextResponse.json({ message: 'יש לכתוב כמה מילים על החוויה.' }, { status: 422 })
  if (text.length > 500) return NextResponse.json({ message: 'הביקורת ארוכה מדי (עד 500 תווים).' }, { status: 422 })

  // Only registered candidates (people who actually go on dates) can review.
  const found = await findRegistration(admin, caller.user.id)
  if (!found) return NextResponse.json({ message: 'ביקורות נכתבות על ידי מועמדים רשומים בלבד.' }, { status: 403 })

  const { data: spot } = await admin.from('date_spots').select('id').eq('id', spotId).eq('is_published', true).maybeSingle()
  if (!spot) return NextResponse.json({ message: 'המקום לא נמצא.' }, { status: 404 })

  const label = found.gender === 'female' ? 'בחורה' : 'בחור'
  const { data: existing } = await admin
    .from('date_spot_reviews').select('id').eq('spot_id', spotId).eq('candidate_user_id', caller.user.id).maybeSingle()

  let row: any
  if (existing) {
    const { data, error } = await admin
      .from('date_spot_reviews').update({ rating, comment: text, author_label: label }).eq('id', existing.id).select('id, rating, comment, author_label, created_at').single()
    if (error) { console.error('review update failed:', error.message); return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 }) }
    row = data
  } else {
    const { data, error } = await admin
      .from('date_spot_reviews')
      .insert({ spot_id: spotId, rating, comment: text, candidate_user_id: caller.user.id, author_label: label })
      .select('id, rating, comment, author_label, created_at').single()
    if (error) { console.error('review insert failed:', error.message); return NextResponse.json({ message: 'השמירה נכשלה. נסו שוב.' }, { status: 502 }) }
    row = data
  }

  return NextResponse.json({
    ok: true,
    updated: !!existing,
    review: { id: row.id, authorName: row.author_label, rating: row.rating, text: row.comment, createdAt: String(row.created_at).slice(0, 10) },
  })
}

/** An administrator removes a review. Body: { reviewId } */
export async function DELETE(req: NextRequest) {
  const admin = adminClient()
  if (!admin) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const { data: mm } = await admin.from('matchmakers').select('is_admin').eq('user_id', caller.user.id).maybeSingle()
  if (!mm?.is_admin) return NextResponse.json({ message: 'אין הרשאה.' }, { status: 403 })

  let body: { reviewId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const reviewId = String(body.reviewId ?? '')
  if (!uuid.test(reviewId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  const { error } = await admin.from('date_spot_reviews').delete().eq('id', reviewId)
  if (error) return NextResponse.json({ message: 'המחיקה נכשלה.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
