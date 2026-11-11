import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  buildProfilePdf,
  buildMaleProfilePdf,
  buildFullResumePdf,
  buildMaleFullResumePdf,
} from '@/lib/pdf/exportProfile'
import { mapProfileRow, PROFILE_SELECT } from '@/lib/supabase/mapProfile'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import type { FemaleProfile, MaleProfile } from '@/types/registration'

export const runtime = 'nodejs'

/**
 * Builds a candidate PDF. The profile is read from the database with the caller's own sign-in,
 * so row-level security decides who may export: signed-in matchmakers only.
 * type=card is the inquiry card (no surname, no phone); type=full is the complete internal resume.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const type = req.nextUrl.searchParams.get('type') === 'full' ? 'full' : 'card'
    const locale = (req.nextUrl.searchParams.get('locale') ?? 'he') as 'he' | 'en'

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!token) return NextResponse.json({ error: 'נדרשת התחברות.' }, { status: 401 })
    if (!url || !anon) return NextResponse.json({ error: 'השירות אינו זמין כרגע.' }, { status: 503 })

    const db = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData } = await db.auth.getUser(token)
    if (!userData?.user) return NextResponse.json({ error: 'נדרשת התחברות.' }, { status: 401 })

    let profile: FemaleProfile | MaleProfile | undefined
    let gender: 'male' | 'female' = 'female'
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      const { data: row, error } = await db.from('profiles').select(PROFILE_SELECT).eq('id', id).maybeSingle()
      if (error) {
        console.error('[PDF export] profile query failed:', error.message)
        return NextResponse.json({ error: 'טעינת הפרופיל נכשלה.' }, { status: 502 })
      }
      if (row) {
        profile = mapProfileRow(row)
        gender = (row as any).gender === 'male' ? 'male' : 'female'
      }
    } else {
      // Built-in demo profiles keep their old non-uuid ids.
      const f = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
      const m = MOCK_MALE_PROFILES.find((p) => p.id === id)
      profile = f ?? m
      gender = m ? 'male' : 'female'
    }
    if (!profile) return NextResponse.json({ error: 'הפרופיל לא נמצא, או שאין לך הרשאה לראות אותו.' }, { status: 404 })

    const doc =
      gender === 'male'
        ? type === 'full' ? buildMaleFullResumePdf(profile as MaleProfile, locale) : buildMaleProfilePdf(profile as MaleProfile)
        : type === 'full' ? buildFullResumePdf(profile as FemaleProfile, locale) : buildProfilePdf(profile as FemaleProfile)

    const buffer = await renderToBuffer(doc)
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type === 'full' ? 'resume' : 'card'}-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[PDF export] Error:', err)
    return NextResponse.json(
      { error: 'יצירת ה-PDF נכשלה', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
