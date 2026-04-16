// ─── Shared ───────────────────────────────────────────────────────────────────

export type Trait =
  | 'calm' | 'happy' | 'serious' | 'flowing' | 'deep'
  | 'social' | 'proactive' | 'shy' | 'communicative'

export type RelationshipValue =
  | 'stability' | 'emotional' | 'aspirations' | 'family'
  | 'homey' | 'depth' | 'lightness' | 'spiritual' | 'worldview'

export type Brings =
  | 'stability' | 'emotional' | 'commitment' | 'responsibility'
  | 'homey' | 'depth' | 'lightness' | 'reliability' | 'communication'

export type Flexibility = 'preferred' | 'important' | 'very_important' | 'not_important'

export type PhoneType = 'kosher' | 'filtered' | 'smartphone' | 'work_smartphone'

// ─── Male ─────────────────────────────────────────────────────────────────────

export type MaleStyle = 'yeshivish' | 'open_ish' | 'open' | 'modern' | 'very_modern'
export type MalePartnerStyle = 'closed' | 'open' | 'open_ish' | 'modern' | 'very_modern'
export type MaleClothing = 'only_bw' | 'always_colorful' | 'colorful_weekday' | 'black_kippah' | 'other_kippah'
export type MalePartnerClothing =
  | 'modern_modest' | 'very_modern' | 'very_simple' | 'simple_updated'
  | 'wig_any' | 'wig_only' | 'kerchief' | 'wig_kerchief' | 'wig_ribbon' | 'wig_hat' | 'no_preference'

export interface MaleRegistrationData {
  // Personal
  firstName: string
  lastName: string
  age: number
  hebrewBirthday: string
  status: string
  community: string
  occupation: string
  city: string
  phone: string
  email: string
  // Photos
  photos: string[]
  // Section 1
  style: MaleStyle
  partnerStyle: MalePartnerStyle
  preferredStream: string
  // Section 3
  traits: Trait[]
  // Section 4
  relationshipValues: RelationshipValue[]
  // Section 5
  brings: Brings[]
  // Section 6
  doesntSuit: string
  // Section 7
  flexibility: Flexibility
  // Section 8
  clothing: MaleClothing
  // Section 9
  partnerClothing: MalePartnerClothing
  // Phone
  phoneType: PhoneType
  // Free text
  aboutMe: string
  aboutPartner: string
}

// ─── Female ───────────────────────────────────────────────────────────────────

export type FemaleStyle = 'shmura' | 'open_ish' | 'open' | 'modern' | 'very_modern'
export type FemalePartnerStyle = 'shmur' | 'open_ish' | 'open' | 'modern' | 'very_modern'
export type FemaleClothing = 'very_simple' | 'simple' | 'classic' | 'stylish' | 'respectable' | 'modern' | 'very_modern'
export type Headcovering = 'wig_no_cut' | 'wig_with_cut' | 'wig_only' | 'wig_plus_cover' | 'kerchief_only' | 'no_preference'
export type FemalePartnerClothing = 'only_bw' | 'bw_elegant' | 'colorful_weekday' | 'very_modern'

export interface FemaleRegistrationData {
  // Personal
  firstName: string
  lastName: string
  age: number
  hebrewBirthday: string
  status: string
  community: string
  occupation: string
  city: string
  phone: string
  email: string
  // Photos
  photos: string[]
  // Section 1
  style: FemaleStyle
  partnerStyle: FemalePartnerStyle
  preferredStream: string
  // Section 3
  traits: Trait[]
  // Section 4
  relationshipValues: RelationshipValue[]
  // Section 5
  brings: Brings[]
  // Section 6
  doesntSuit: string
  // Section 7
  flexibility: Flexibility
  // Section 8
  clothing: FemaleClothing
  // Section 9
  headcovering: Headcovering
  // Section 10
  partnerClothing: FemalePartnerClothing
  // Section 11
  phoneType: PhoneType
  // Free text
  aboutMe: string
  aboutPartner: string
}

// ─── Matchmaker / Profile ─────────────────────────────────────────────────────

export interface Note {
  id: string
  author: string
  text: string
  createdAt: Date
}

// green      = active match (profile locked by a matchmaker)
// orange     = offer made in the last 7 days
// light_red  = no offer for ~1 month (8-60 days)
// bright_red = no offer for >2 months (61+ days) or never offered
export type MatchmakerStatus = 'green' | 'orange' | 'light_red' | 'bright_red'

export interface FemaleProfile extends FemaleRegistrationData {
  id: string
  matchmakerStatus: MatchmakerStatus
  notes: Note[]
  lockedAt: Date | null
  lockedBy?: string
  lastOfferDate?: Date | null
}

export interface MaleProfile extends MaleRegistrationData {
  id: string
  matchmakerStatus: MatchmakerStatus
  notes: Note[]
  lockedAt: Date | null
  lockedBy?: string
  lastOfferDate?: Date | null
}
