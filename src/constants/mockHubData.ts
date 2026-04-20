import type { SocialPost, Announcement, MatchProgress, MatchmakerLeaderboardEntry } from '@/types/hub'

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000)
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000)

// Main demo matchmaker = shadchan@bonim-olamot.co.il
// Admin demo = admin@bonim-olamot.co.il

export const MOCK_ANNOUNCEMENT: Announcement = {
  id: 'a1',
  text: 'פגישת זום מחר בשעה 20:00 – נא לאשר השתתפות עד הבוקר 📢',
  createdBy: 'admin@bonim-olamot.co.il',
  active: true,
}

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'p1',
    author: 'שדכן ראשי',
    authorEmail: 'shadchan@bonim-olamot.co.il',
    content: 'דיברתי עם המשגיח של רחל כהן – משוב חיובי מאוד! ממשיכים בבירורים.',
    taggedProfiles: [{ id: 'f1', name: 'רחל כהן', gender: 'female' }],
    createdAt: hoursAgo(1),
    isAnnouncement: false,
  },
  {
    id: 'p2',
    author: 'מרים כ.',
    authorEmail: 'miriam@bonim-olamot.co.il',
    content: 'הצעה חדשה עבור מרים לוי – ממתינה לתשובה מצד הבחור.',
    taggedProfiles: [{ id: 'f2', name: 'מרים לוי', gender: 'female' }],
    createdAt: hoursAgo(3),
    isAnnouncement: false,
  },
  {
    id: 'p3',
    author: 'שדכן ראשי',
    authorEmail: 'shadchan@bonim-olamot.co.il',
    content: 'עדכון: הפגישה הראשונה הלכה מצוין – מתקדמים לפגישה שנייה!',
    taggedProfiles: [
      { id: 'f3', name: 'דינה ברגר', gender: 'female' },
      { id: 'm2', name: 'יוסף כהן', gender: 'male' },
    ],
    createdAt: daysAgo(1),
    isAnnouncement: false,
  },
  {
    id: 'p4',
    author: 'מרים כ.',
    authorEmail: 'miriam@bonim-olamot.co.il',
    content: 'בירורים הסתיימו בהצלחה – מזל טוב! שידוך מושלם ❤️',
    taggedProfiles: [
      { id: 'f5', name: 'שרה ישראלי', gender: 'female' },
      { id: 'm4', name: 'שמואל ברגר', gender: 'male' },
    ],
    createdAt: daysAgo(2),
    isAnnouncement: false,
  },
  {
    id: 'p5',
    author: 'שדכן ראשי',
    authorEmail: 'shadchan@bonim-olamot.co.il',
    content: 'תזכורת: יש עוד 3 מועמדות עם סטטוס ״אדום עז״ שמחכות לטיפול – נא לתת עדיפות.',
    taggedProfiles: [],
    createdAt: daysAgo(3),
    isAnnouncement: false,
  },
  {
    id: 'p6',
    author: 'רות ב.',
    authorEmail: 'ruth@bonim-olamot.co.il',
    content: 'שיחה עם הורים של יוסף כהן – מאוד מעוניינים להתקדם לפגישה.',
    taggedProfiles: [{ id: 'm2', name: 'יוסף כהן', gender: 'male' }],
    createdAt: daysAgo(4),
    isAnnouncement: false,
  },
]

export const MOCK_MATCH_PROGRESS: MatchProgress[] = [
  {
    id: 'mp1',
    femaleId: 'f1',
    femaleName: 'רחל כהן',
    maleId: 'm1',
    maleName: 'יצחק לוי',
    stage: 'meeting_1',
    matchmakerName: 'שדכן ראשי',
    matchmakerEmail: 'shadchan@bonim-olamot.co.il',
    updatedAt: daysAgo(1),
  },
  {
    id: 'mp2',
    femaleId: 'f4',
    femaleName: 'אסתר מנדלוביץ',
    maleId: 'm3',
    maleName: 'דוד לוי',
    stage: 'checking',
    matchmakerName: 'שדכן ראשי',
    matchmakerEmail: 'shadchan@bonim-olamot.co.il',
    updatedAt: daysAgo(2),
  },
  {
    id: 'mp3',
    femaleId: 'f3',
    femaleName: 'דינה ברגר',
    maleId: 'm2',
    maleName: 'יוסף כהן',
    stage: 'meeting_2',
    matchmakerName: 'שדכן ראשי',
    matchmakerEmail: 'shadchan@bonim-olamot.co.il',
    updatedAt: hoursAgo(2),
  },
  {
    id: 'mp4',
    femaleId: 'f2',
    femaleName: 'מרים לוי',
    maleId: 'm5',
    maleName: 'אהרן גולד',
    stage: 'proposal_sent',
    matchmakerName: 'מרים כ.',
    matchmakerEmail: 'miriam@bonim-olamot.co.il',
    updatedAt: hoursAgo(6),
  },
  {
    id: 'mp5',
    femaleId: 'f5',
    femaleName: 'שרה ישראלי',
    maleId: 'm4',
    maleName: 'שמואל ברגר',
    stage: 'closing',
    matchmakerName: 'מרים כ.',
    matchmakerEmail: 'miriam@bonim-olamot.co.il',
    updatedAt: hoursAgo(4),
  },
  {
    id: 'mp6',
    femaleId: 'f6',
    femaleName: 'חוה שפירא',
    maleId: 'm6',
    maleName: 'אברהם רוזנברג',
    stage: 'checking',
    matchmakerName: 'רות ב.',
    matchmakerEmail: 'ruth@bonim-olamot.co.il',
    updatedAt: daysAgo(3),
  },
]

export const MOCK_LEADERBOARD: MatchmakerLeaderboardEntry[] = [
  {
    name: 'שדכן ראשי',
    email: 'shadchan@bonim-olamot.co.il',
    postsCount: 12,
    statusUpdatesCount: 8,
    successfulMatchesCount: 3,
    activeProposalsCount: 5,
  },
  {
    name: 'מרים כ.',
    email: 'miriam@bonim-olamot.co.il',
    postsCount: 9,
    statusUpdatesCount: 6,
    successfulMatchesCount: 2,
    activeProposalsCount: 4,
  },
  {
    name: 'רות ב.',
    email: 'ruth@bonim-olamot.co.il',
    postsCount: 7,
    statusUpdatesCount: 4,
    successfulMatchesCount: 1,
    activeProposalsCount: 3,
  },
]
