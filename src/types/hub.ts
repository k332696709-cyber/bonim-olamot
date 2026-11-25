export type MatchStage = 'checking' | 'proposal_sent' | 'meeting_1' | 'meeting_2' | 'more_meetings' | 'closing'

export const MATCH_STAGES: MatchStage[] = [
  'checking',
  'proposal_sent',
  'meeting_1',
  'meeting_2',
  'more_meetings',
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
  /** Matchmaking fee the matchmaker sent to both candidates (null until sent). */
  feeAmount?: number | null
  feeSentAt?: string | null
  femaleAck?: boolean
  /** When the matchmaker confirmed the fee was received (after the engagement closed). */
  feePaidAt?: string | null
  maleAck?: boolean
  /** The matchmaker who opened the match, and an optional colleague working on it with them. */
  /** "rejected" means the proposal came down and the match will not go forward. */
  status?: 'active' | 'closed' | 'rejected'
  matchmakerId?: string | null
  coId?: string | null
  coName?: string
  coEmail?: string
}

export interface MatchmakerLeaderboardEntry {
  name: string
  email: string
  postsCount: number
  statusUpdatesCount: number
  successfulMatchesCount: number
  activeProposalsCount: number
  /** Proposals with no update for 7+ days. */
  stalledCount?: number
}
