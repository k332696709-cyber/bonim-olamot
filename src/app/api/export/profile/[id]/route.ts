import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { buildProfilePdf, buildMaleProfilePdf } from '@/lib/pdf/exportProfile'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const gender = req.nextUrl.searchParams.get('gender') ?? 'female'

  // TODO: replace with real database lookup
  let doc: ReturnType<typeof buildProfilePdf> | ReturnType<typeof buildMaleProfilePdf> | null = null

  if (gender === 'male') {
    const profile = MOCK_MALE_PROFILES.find((p) => p.id === id)
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    doc = buildMaleProfilePdf(profile)
  } else {
    const profile = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    doc = buildProfilePdf(profile)
  }

  const buffer = await renderToBuffer(doc)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="profile-${id}.pdf"`,
    },
  })
}
