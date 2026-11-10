/* eslint-disable */
import type { FemaleProfile, MaleProfile } from '@/types/registration'

/** Select string for a profile with its notes (same as the dashboard uses). */
export const PROFILE_SELECT =
  '*, profile_notes(id, content, created_at, matchmakers(first_name, last_name))'

/** Turns a `profiles` database row into the camelCase profile the cards and engine use. */
export function mapProfileRow(row: any): FemaleProfile | MaleProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    hebrewBirthday: row.hebrew_birthday ?? '',
    status: row.marital_status ?? 'single',
    hasChildren: row.has_children,
    numberOfChildren: row.number_of_children ?? undefined,
    community: row.community ?? '',
    occupation: row.occupation ?? '',
    city: row.city ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    photos: row.photos ?? [],
    style: row.style ?? '',
    partnerStyle: row.partner_style ?? '',
    preferredStream: row.preferred_stream ?? '',
    traits: row.traits ?? [],
    relationshipValues: row.relationship_values ?? [],
    brings: row.brings ?? [],
    doesntSuit: row.doesnt_suit ?? '',
    flexibility: row.flexibility ?? 'preferred',
    clothing: row.clothing ?? '',
    headcovering: row.headcovering ?? '',
    partnerClothing: row.partner_clothing ?? '',
    phoneType: row.phone_type ?? 'kosher',
    aboutMe: row.about_me ?? '',
    aboutPartner: row.about_partner ?? '',
    matchmakerStatus: row.matchmaker_status,
    lockedAt: row.locked_at ? new Date(row.locked_at) : null,
    lockedBy: row.locked_by ?? undefined,
    lastOfferDate: row.last_offer_date ? new Date(row.last_offer_date) : null,
    notes: (row.profile_notes ?? []).map((n: any) => ({
      id: n.id,
      author: n.matchmakers ? `${n.matchmakers.first_name} ${n.matchmakers.last_name}` : '',
      text: n.content,
      createdAt: new Date(n.created_at),
    })),
  } as unknown as FemaleProfile | MaleProfile
}
