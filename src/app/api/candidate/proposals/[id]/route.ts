import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration } from '@/lib/server/photos'
import { loadProposalDetail } from '@/lib/server/proposalDetail'

export const runtime = 'nodejs'

/** The full card of one proposal, within what a candidate may see (see proposalDetail.ts). */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  if (!caller?.user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })
  const found = await findRegistration(admin, caller.user.id)
  if (!found?.reg.profile_id) return NextResponse.json({ message: 'יש להשלים את שאלון ההיכרות כדי להמשיך.' }, { status: 403 })

  const detail = await loadProposalDetail(admin, found.reg.profile_id, params.id)
  if (!detail) return NextResponse.json({ message: 'ההצעה לא נמצאה.' }, { status: 404 })
  return NextResponse.json({ detail })
}
