/* eslint-disable */
// Server-only: what a candidate may see of another candidate's full card from a proposal.
// Never included: phone, email, WhatsApp and contact preferences, the medical/psychological answers,
// and the details of whoever filled the card. The inquiry contacts (names and phones of references)
// appear only once both sides are interested. Photos appear unless their owner chose to keep them
// private until mutual interest.
import { allFields, FEMALE_FORM, MALE_FORM } from '@/constants/registrationForms'
import { PHOTO_BUCKET } from '@/lib/server/photos'

const HIDDEN = new Set([
  'fullName', 'lastName', 'birthDate', 'phone', 'email', 'whatsapp', 'whatsappNumber', 'notifySms', 'notifyCalls',
  'medical', 'medicalDetail', 'filledBy', 'fillerContact', 'professionalStudies', 'country', 'photo',
  'password', 'photosPrivate', 'updatedAt',
])

export interface ProposalDetail {
  name: string
  mutual: boolean
  photos: string[]
  photosHidden: boolean
  resume: { label: string; value: string }[]
  references: { name: string; relation: string; phone: string }[] | null
}

export async function loadProposalDetail(admin: any, myProfileId: string, targetId: string): Promise<ProposalDetail | null> {
  const { data: target } = await admin.from('profiles').select('id, gender, first_name, last_name, photos').eq('id', targetId).maybeSingle()
  const { data: me } = await admin.from('profiles').select('gender').eq('id', myProfileId).maybeSingle()
  if (!target || !me || target.gender === me.gender) return null

  const table = target.gender === 'male' ? 'male_registrations' : 'female_registrations'
  const { data: reg } = await admin.from(table).select('answers').eq('profile_id', targetId).maybeSingle()
  const a: Record<string, string> = reg?.answers ?? {}

  // Mutual: each side marked "interested" in the other.
  const { data: ints } = await admin
    .from('match_interests').select('from_profile_id, to_profile_id, kind')
    .or(`and(from_profile_id.eq.${myProfileId},to_profile_id.eq.${targetId}),and(from_profile_id.eq.${targetId},to_profile_id.eq.${myProfileId})`)
    .eq('kind', 'interested')
  const mutual = (ints ?? []).length >= 2

  const form = target.gender === 'male' ? MALE_FORM : FEMALE_FORM
  const resume: { label: string; value: string }[] = []
  for (const f of allFields(form)) {
    if (f.type === 'file' || HIDDEN.has(f.id) || /^ref\d+/.test(f.id)) continue
    const v = (a[f.id] ?? '').trim()
    if (!v) continue
    resume.push({ label: f.label.replace(/[:?]\s*$/, ''), value: v.split(' | ').join(', ') })
  }

  const photosHidden = a.photosPrivate === '1' && !mutual
  let photos: string[] = []
  if (!photosHidden) {
    const paths: string[] = target.photos ?? []
    for (const path of paths.slice(0, 5)) {
      const { data: signed } = await admin.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600)
      if (signed?.signedUrl) photos.push(signed.signedUrl)
    }
  }

  let references: ProposalDetail['references'] = null
  if (mutual) {
    references = []
    for (let n = 1; n <= 10; n++) {
      const name = (a[`ref${n}Name`] ?? '').trim()
      const phone = (a[`ref${n}Phone`] ?? '').trim()
      if (!name && !phone) continue
      references.push({ name, relation: (a[`ref${n}Relation`] ?? '').trim(), phone })
    }
  }

  return {
    name: `${target.first_name ?? ''} ${target.last_name ?? ''}`.trim(),
    mutual,
    photos,
    photosHidden,
    resume,
    references,
  }
}
