import { NextRequest, NextResponse } from 'next/server'
import { BUSY_MESSAGE, busyProfiles } from '@/lib/server/matches'
import { entryToProfileRow, ownEntry, poolOwner } from '@/lib/server/pool'

export const runtime = 'nodejs'

/**
 * Opens a pool entry to the site and starts a match with a profile that is already there. The entry becomes
 * a profile, the match belongs to this matchmaker, and both are locked by the usual rule (nobody can
 * open another match for either of them). If the match comes down, the profile is removed again (see
 * match-status) and the entry is private again. Body: { poolId, otherProfileId }.
 */
export async function POST(req: NextRequest) {
  const who = await poolOwner(req)
  if ('error' in who) return who.error
  const { admin, mm } = who

  let body: { poolId?: unknown; otherProfileId?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 }) }
  const otherId = String(body.otherProfileId ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(otherId)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const entry = await ownEntry(admin, mm.id, String(body.poolId ?? ''))
  if (!entry) return NextResponse.json({ message: 'לא נמצא.' }, { status: 404 })
  if (entry.profile_id) return NextResponse.json({ message: 'כבר נפתח לו/לה שידוך.' }, { status: 409 })

  const { data: other } = await admin.from('profiles').select('id, gender').eq('id', otherId).maybeSingle()
  if (!other || other.gender === entry.gender) return NextResponse.json({ message: 'הפרופיל לא נמצא.' }, { status: 404 })
  if ((await busyProfiles(admin, [otherId])).size > 0) return NextResponse.json({ message: BUSY_MESSAGE }, { status: 409 })

  const row = entryToProfileRow(entry)
  const { data: profile, error: pErr } = await admin
    .from('profiles').insert({ ...row, matchmaker_status: 'bright_red' }).select('id').single()
  if (pErr || !profile) {
    console.error('pool profile creation failed:', pErr?.message)
    return NextResponse.json({ message: 'פתיחה לאתר נכשלה. נסו שוב.' }, { status: 502 })
  }

  const femaleId = entry.gender === 'female' ? profile.id : otherId
  const maleId = entry.gender === 'male' ? profile.id : otherId
  const { data: match, error: mErr } = await admin
    .from('matches').insert({ female_id: femaleId, male_id: maleId, matchmaker_id: mm.id }).select('id').single()
  if (mErr || !match) {
    console.error('pool match creation failed:', mErr?.message)
    await admin.from('profiles').delete().eq('id', profile.id)
    return NextResponse.json({ message: 'פתיחת השידוך נכשלה. נסו שוב.' }, { status: 502 })
  }

  await admin.from('matchmaker_pool').update({ profile_id: profile.id, match_id: match.id }).eq('id', entry.id)
  return NextResponse.json({ ok: true, matchId: match.id })
}
