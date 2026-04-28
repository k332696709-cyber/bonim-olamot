import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  buildProfilePdf,
  buildMaleProfilePdf,
  buildFullResumePdf,
  buildMaleFullResumePdf,
} from '@/lib/pdf/exportProfile'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const gender = req.nextUrl.searchParams.get('gender') ?? 'female'
    const type   = req.nextUrl.searchParams.get('type')   ?? 'card'
    const locale = (req.nextUrl.searchParams.get('locale') ?? 'he') as 'he' | 'en'

    let doc
    if (gender === 'male') {
      const profile = MOCK_MALE_PROFILES.find((p) => p.id === id)
      if (!profile) return NextResponse.json({ error: `Male profile ${id} not found` }, { status: 404 })
      doc = type === 'full'
        ? buildMaleFullResumePdf(profile, locale)
        : buildMaleProfilePdf(profile)
    } else {
      const profile = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
      if (!profile) return NextResponse.json({ error: `Female profile ${id} not found` }, { status: 404 })
      doc = type === 'full'
        ? buildFullResumePdf(profile, locale)
        : buildProfilePdf(profile)
    }

    const buffer = await renderToBuffer(doc)
    const suffix = type === 'full' ? 'resume' : 'card'

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${suffix}-${id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[PDF export] Error:', err)
    return NextResponse.json(
      { error: 'PDF generation failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
