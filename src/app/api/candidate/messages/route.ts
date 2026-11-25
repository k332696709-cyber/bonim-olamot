import { NextRequest, NextResponse } from 'next/server'
import { clean, serviceClient } from '@/lib/server/messages'
import { sendMail } from '@/lib/server/notify'

export const runtime = 'nodejs'

async function whoIs(req: NextRequest) {
  const admin = serviceClient()
  if (!admin) return { error: NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 }) }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return { error: NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 }) }
  return { admin, userId: caller.user.id as string }
}

/** The conversations of the signed-in candidate, one per matchmaker, and how many messages are unread. */
export async function GET(req: NextRequest) {
  const w = await whoIs(req)
  if ('error' in w) return w.error
  const { data } = await w.admin
    .from('candidate_messages')
    .select('id, matchmaker_id, from_candidate, body, created_at, read_at, matchmakers(first_name, last_name)')
    .eq('candidate_user_id', w.userId)
    .order('created_at', { ascending: true })
    .limit(500)

  const threads = new Map<string, { matchmakerId: string; name: string; messages: any[] }>()
  let unread = 0
  for (const m of data ?? []) {
    let t = threads.get(m.matchmaker_id)
    if (!t) {
      t = { matchmakerId: m.matchmaker_id, name: m.matchmakers ? `${m.matchmakers.first_name ?? ''} ${m.matchmakers.last_name ?? ''}`.trim() : '', messages: [] }
      threads.set(m.matchmaker_id, t)
    }
    t.messages.push({ id: m.id, mine: m.from_candidate, body: m.body, at: m.created_at })
    if (!m.from_candidate && !m.read_at) unread++
  }
  const list = Array.from(threads.values()).sort((a, b) => b.messages[b.messages.length - 1].at.localeCompare(a.messages[a.messages.length - 1].at))
  return NextResponse.json({ threads: list, unread })
}

/** The candidate answers in a conversation a matchmaker started. Body: { matchmakerId, body }. */
export async function POST(req: NextRequest) {
  const w = await whoIs(req)
  if ('error' in w) return w.error
  let body: { matchmakerId?: string; body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const matchmakerId = String(body.matchmakerId ?? '')
  const text = clean(body.body)
  if (!/^[0-9a-f-]{36}$/i.test(matchmakerId) || !text) return NextResponse.json({ message: 'נא לכתוב הודעה.' }, { status: 422 })

  // A candidate answers; they cannot start a conversation with a matchmaker.
  const { data: started } = await w.admin
    .from('candidate_messages').select('id').eq('candidate_user_id', w.userId).eq('matchmaker_id', matchmakerId).eq('from_candidate', false).limit(1)
  if (!started || started.length === 0) return NextResponse.json({ message: 'אפשר להשיב רק להודעה ששדכן/ית שלח/ה.' }, { status: 403 })

  const { error } = await w.admin
    .from('candidate_messages').insert({ candidate_user_id: w.userId, matchmaker_id: matchmakerId, from_candidate: true, body: text })
  if (error) {
    console.error('candidate reply failed:', error.message)
    return NextResponse.json({ message: 'השליחה נכשלה. נסו שוב.' }, { status: 502 })
  }

  // The matchmaker is told by email that someone answered (without the text).
  const { data: mm } = await w.admin.from('matchmakers').select('email').eq('id', matchmakerId).maybeSingle()
  if (mm?.email) await sendMail(mm.email, 'מועמד/ת השיב/ה להודעה שלך', ['יש תשובה חדשה להודעה ששלחת.'], '/he/matchmaker')
  return NextResponse.json({ ok: true })
}

/** The candidate opened the messages: what was written to them is now read. */
export async function PATCH(req: NextRequest) {
  const w = await whoIs(req)
  if ('error' in w) return w.error
  await w.admin
    .from('candidate_messages').update({ read_at: new Date().toISOString() })
    .eq('candidate_user_id', w.userId).eq('from_candidate', false).is('read_at', null)
  return NextResponse.json({ ok: true })
}
