import { NextRequest, NextResponse } from 'next/server'
import { ownEntry, poolOwner, suggestionsFor } from '@/lib/server/pool'

export const runtime = 'nodejs'

/** Profiles on the site that fit one of the matchmaker's own pool entries. */
export async function GET(req: NextRequest) {
  const who = await poolOwner(req)
  if ('error' in who) return who.error
  const { admin, mm } = who
  const entry = await ownEntry(admin, mm.id, new URL(req.url).searchParams.get('id') ?? '')
  if (!entry) return NextResponse.json({ message: 'לא נמצא.' }, { status: 404 })
  if (entry.profile_id) return NextResponse.json({ suggestions: [] })
  return NextResponse.json({ suggestions: await suggestionsFor(admin, entry) })
}
