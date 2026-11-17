import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loadProposals } from '@/lib/server/proposals'
import { notifyCandidate } from '@/lib/server/candidateNotify'

export const runtime = 'nodejs'
export const maxDuration = 60

/** A suggestion has to be at least this good a match to be announced. */
const MIN_SCORE = 60

/**
 * Runs once a day (Vercel cron). For every candidate whose profile is live, finds suggestions they
 * have not been told about yet and sends one short notice (email, plus SMS for those who
 * registered it). The first time a candidate is seen, the existing suggestions are only recorded, so
 * nobody gets a flood on the first day. Protected by CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ message: 'CRON_SECRET is not set.' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ message: 'Supabase is not configured.' }, { status: 503 })
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) as any

  const { data: profiles } = await admin.from('profiles').select('id')
  let notified = 0
  let recorded = 0

  for (const p of profiles ?? []) {
    try {
      const result = await loadProposals(admin, p.id)
      if (!result) continue
      const good = result.proposals.filter((x) => x.state === 'none' && x.score >= MIN_SCORE)
      if (good.length === 0) continue

      const { data: seen } = await admin.from('proposal_notices').select('proposal_id').eq('profile_id', p.id)
      const seenIds = new Set<string>((seen ?? []).map((r: any) => r.proposal_id))
      const fresh = good.filter((x) => !seenIds.has(x.id))
      if (fresh.length === 0) continue

      await admin.from('proposal_notices').insert(fresh.map((x) => ({ profile_id: p.id, proposal_id: x.id })))
      recorded += fresh.length
      // First time for this candidate: just record what already exists.
      if (seenIds.size === 0) continue

      const sent = await notifyCandidate(admin, p.id, 'newProposals', { count: String(fresh.length) })
      if (sent.email || sent.sms) notified++
    } catch (e) {
      console.error('proposal notice failed for', p.id, e instanceof Error ? e.message : e)
    }
  }

  return NextResponse.json({ ok: true, candidates: (profiles ?? []).length, notified, recorded })
}
