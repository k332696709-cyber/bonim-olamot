import { NextRequest, NextResponse } from 'next/server'
import { candidateOfProfile, clean, notifyCandidateOfMessage, staffFrom } from '@/lib/server/messages'

export const runtime = 'nodejs'

const uuid = /^[0-9a-f-]{36}$/i

/**
 * Without profileId: the candidates who wrote back and were not read yet (for the dashboard).
 * With profileId: the conversation with that candidate. A matchmaker sees only their own conversation;
 * the administrator sees all. Opening it marks the candidate's replies as read.
 */
export async function GET(req: NextRequest) {
  const s = await staffFrom(req)
  if ('error' in s) return s.error
  const { admin, mm } = s
  const profileId = req.nextUrl.searchParams.get('profileId')

  if (!profileId) {
    let q = admin.from('candidate_messages').select('candidate_user_id, created_at').eq('from_candidate', true).is('read_at', null)
    if (!mm.is_admin) q = q.eq('matchmaker_id', mm.id)
    const { data: rows } = await q.order('created_at', { ascending: false }).limit(200)
    const byUser = new Map<string, { count: number; last: string }>()
    for (const r of rows ?? []) {
      const e = byUser.get(r.candidate_user_id)
      byUser.set(r.candidate_user_id, { count: (e?.count ?? 0) + 1, last: e?.last ?? r.created_at })
    }
    const unread: { profileId: string | null; name: string; count: number; last: string }[] = []
    for (const [userId, e] of Array.from(byUser.entries())) {
      let name = ''
      let pid: string | null = null
      for (const table of ['male_registrations', 'female_registrations']) {
        const { data } = await admin.from(table).select('profile_id, answers').eq('user_id', userId).maybeSingle()
        if (data) { pid = data.profile_id ?? null; name = `${data.answers?.fullName ?? ''} ${data.answers?.lastName ?? ''}`.trim(); break }
      }
      unread.push({ profileId: pid, name, count: e.count, last: e.last })
    }
    return NextResponse.json({ unread })
  }

  if (!uuid.test(profileId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  const c = await candidateOfProfile(admin, profileId)
  if (!c) return NextResponse.json({ messages: [], reachable: false })

  let q = admin
    .from('candidate_messages')
    .select('id, matchmaker_id, from_candidate, body, created_at, read_at, matchmakers(first_name, last_name)')
    .eq('candidate_user_id', c.userId)
  if (!mm.is_admin) q = q.eq('matchmaker_id', mm.id)
  const { data } = await q.order('created_at', { ascending: true }).limit(300)

  // The candidate's replies are now read.
  let mark = admin.from('candidate_messages').update({ read_at: new Date().toISOString() })
    .eq('candidate_user_id', c.userId).eq('from_candidate', true).is('read_at', null)
  if (!mm.is_admin) mark = mark.eq('matchmaker_id', mm.id)
  await mark

  return NextResponse.json({
    reachable: true,
    messages: (data ?? []).map((m: any) => ({
      id: m.id,
      fromCandidate: m.from_candidate,
      body: m.body,
      at: m.created_at,
      matchmaker: m.matchmakers ? `${m.matchmakers.first_name ?? ''} ${m.matchmakers.last_name ?? ''}`.trim() : '',
      mine: m.matchmaker_id === mm.id,
    })),
  })
}

/** A matchmaker or the administrator writes to a candidate. Body: { profileId, body }. */
export async function POST(req: NextRequest) {
  const s = await staffFrom(req)
  if ('error' in s) return s.error
  const { admin, mm } = s
  let body: { profileId?: string; body?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  const profileId = String(body.profileId ?? '')
  const text = clean(body.body)
  if (!uuid.test(profileId) || !text) return NextResponse.json({ message: 'נא לכתוב הודעה.' }, { status: 422 })

  const c = await candidateOfProfile(admin, profileId)
  if (!c) return NextResponse.json({ message: 'אי אפשר לשלוח למועמד הזה: אין לו חשבון באתר.' }, { status: 404 })

  const { error } = await admin
    .from('candidate_messages')
    .insert({ candidate_user_id: c.userId, matchmaker_id: mm.id, from_candidate: false, body: text })
  if (error) {
    console.error('message send failed:', error.message)
    return NextResponse.json({ message: 'השליחה נכשלה. נסו שוב.' }, { status: 502 })
  }
  await notifyCandidateOfMessage(c, `${mm.first_name ?? ''} ${mm.last_name ?? ''}`.trim())
  return NextResponse.json({ ok: true })
}
