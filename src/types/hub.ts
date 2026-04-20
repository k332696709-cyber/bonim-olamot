export type MatchStage = 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'closing'

export const MATCH_STAGES: MatchStage[] = [
  'checking',
  'proposal_sent',
  'meeting_1',
  'meeting_2',
  'closing',
]

export interface TaggedProfile {
  id: string
  name: string
  gender: 'male' | 'female'
}

export interface SocialPost {
  id: string
  author: string
  authorEmail: string
  content: string
  taggedProfiles: TaggedProfile[]
  createdAt: Date
  isAnnouncement: boolean
}

export interface Announcement {
  id: string
  text: string
  createdBy: string
  active: boolean
}

export interface MatchProgress {
  id: string
  femaleId: string
  femaleName: string
  maleId: string
  maleName: string
  stage: MatchStage
  matchmakerName: string
  matchmakerEmail: string
  updatedAt: Date
}

export interface MatchmakerLeaderboardEntry {
  name: string
  email: string
  postsCount: number
  statusUpdatesCount: number
  successfulMatchesCount: number
  activeProposalsCount: number
}
