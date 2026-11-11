import Link from 'next/link'

export const metadata = { title: 'מדיניות פרטיות – בונים עולמות' }

const PHONE = '053-379-0008'
const EMAIL = 'b.w008833@gmail.com'

interface Section { title: string; body: string[] }

const HE: Section[] = [
  {
    title: '1. מי אנחנו',
    body: [
      'ארגון בונים עולמות הוא ארגון שידוכים לקהילה החרדית בישראל. מסמך זה מסביר איזה מידע נאסף באתר, למה, מי רואה אותו וכיצד אפשר לבקש לעיין בו או למחוק אותו.',
      `ליצירת קשר בנושאי פרטיות: טלפון ${PHONE}, מייל ${EMAIL}.`,
    ],
  },
  {
    title: '2. איזה מידע אנחנו אוספים',
    body: [
      'מועמדים (מיועדים ומיועדות): כתובת מייל וסיסמה לכניסה (הסיסמה נשמרת מוצפנת אצל ספק ההתחברות ואיננה גלויה לאיש), שם, כינוי, גיל, תאריך לידה, מצב משפחתי ומספר ילדים, עדה והשתייכות, עיר מגורים, עיסוק, לימודים, סוג טלפון, מספר טלפון, אימייל ותמונת שידוכים.',
      'העדפות ואופי: סגנון חיים ולבוש, גישה לטכנולוגיה, מה אתם מחפשים, מאפיינים, מה אתם מביאים לנישואים ומה לא מתאים לכם.',
      'מידע רגיש: מצב רפואי או נפשי (אם מסרתם), מצב ההורים, והערות חופשיות שכתבתם על עצמכם. מידע זה נמסר מרצונכם ובהסכמתכם המפורשת, ורק לצורך השידוך.',
      'מידע על אחרים: שמות ומספרי טלפון של אנשים למסירת הפניות ובירורים. בעת הרשמה אתם מצהירים שיש לכם הסכמה שלהם למסור את הפרטים.',
      'שדכנים: שם, טלפון, אימייל, תאריך לידה, עיר, תמונה (אם הועלתה), ביוגרפיה, ניסיון, תחומי התמחות ושפות.',
      'פניות: שם, טלפון, נושא והודעה שנשלחו בטופס "צור קשר". וכן הודעות שנשלחו לעוזר בצ׳אט באתר.',
    ],
  },
  {
    title: '3. למה אנחנו משתמשים במידע',
    body: [
      'ליצירת פרופיל, להתאמה בין מועמדים, להצעות שידוך ולליווי של שדכנים, וליצירת קשר איתכם. איננו מוכרים מידע ואיננו משתמשים בו לפרסום.',
    ],
  },
  {
    title: '4. מי רואה את המידע',
    body: [
      'מנהל המערכת רואה את כל ההרשמות והפניות.',
      'שדכנים שאושרו על ידי מנהל המערכת רואים פרטי מועמדים במידה הנדרשת לשידוך.',
      'מועמדים אחרים רואים בהצעות רק פרטים בסיסיים (אות ראשונה של השם, גיל, עיר, קהילה, עיסוק וסגנון), בלי שם משפחה ובלי טלפון. פרטי קשר נחשפים רק לאחר עניין הדדי ובליווי שדכן/ית.',
      'תמונת שדכן/ית עשויה להיות מוצגת למשתמשי האתר.',
      'תמונות המועמדים נבדקות על ידי מנהל המערכת. עד שהתמונה אושרה רק המועמד/ת ומנהל המערכת רואים אותה.',
    ],
  },
  {
    title: '5. איפה המידע נשמר ואיך הוא מוגן',
    body: [
      'המידע נשמר אצל ספקי תשתית: Supabase (בסיס נתונים ואחסון קבצים) ו-Vercel (אירוח האתר). הגישה לנתונים מוגבלת בהרשאות לפי תפקיד, והתמונות נשמרות באחסון פרטי.',
      'הודעות שנכתבות לעוזר בצ׳אט ולעוזר החכם עשויות להישלח לשירות בינה מלאכותית (Anthropic) לצורך מענה. אל תכתבו שם מלא, טלפון או פרטים מזהים בצ׳אט.',
      'אף מערכת אינה חסינה לחלוטין. אנו נוקטים אמצעים סבירים להגנה על המידע, אך איננו יכולים להבטיח הגנה מוחלטת.',
    ],
  },
  {
    title: '6. כמה זמן נשמר המידע ואיך מוחקים',
    body: [
      'המידע נשמר כל עוד אתם פעילים במערכת. אפשר לבקש בכל עת למחוק את הפרופיל והתמונה, בפנייה בטלפון או במייל שלמעלה.',
    ],
  },
  {
    title: '7. הזכויות שלכם',
    body: [
      'יש לכם זכות לעיין במידע שנשמר עליכם, לבקש לתקן אותו ולבקש למחוק אותו. נטפל בבקשה בהקדם האפשרי.',
    ],
  },
  {
    title: '8. אחסון בדפדפן',
    body: [
      'האתר שומר בדפדפן שלכם מידע טכני הנדרש לפעולתו, בעיקר את הכניסה שלכם (מועמדים, שדכנים ומנהל) כדי שלא תצטרכו להקליד סיסמה בכל ביקור. איננו משתמשים בעוגיות פרסום.',
    ],
  },
  {
    title: '9. שינויים במדיניות',
    body: ['נעדכן את המסמך כשיהיה צורך, והתאריך שבראש העמוד יתעדכן.'],
  },
]

const EN: Section[] = [
  {
    title: '1. Who we are',
    body: [
      'Bonim Olamot is a matchmaking organization serving the Haredi community in Israel. This page explains what information the site collects, why, who sees it, and how to ask to see or delete it.',
      `Privacy questions: phone ${PHONE}, email ${EMAIL}.`,
    ],
  },
  {
    title: '2. What we collect',
    body: [
      'Candidates: email and a sign-in password (stored hashed by the authentication provider and not visible to anyone), name, nickname, age, date of birth, marital status and number of children, community, city, occupation, education, phone type, phone number, email and a matchmaking photo.',
      'Preferences and character: lifestyle and dress style, technology approach, what you are looking for, your traits, what you bring to marriage and what does not suit you.',
      'Sensitive information: medical or psychological condition (if you provide it), your parents’ status, and free-text notes about yourself. You provide this voluntarily and with your explicit consent, only for matchmaking.',
      'Information about others: names and phone numbers of people to contact for references. By registering you confirm you have their consent to share them.',
      'Matchmakers: name, phone, email, date of birth, city, photo (if uploaded), biography, experience, specialties and languages.',
      'Messages: name, phone, subject and message sent through the contact form, and messages sent to the on-site chat assistant.',
    ],
  },
  {
    title: '3. How we use it',
    body: ['To create your profile, match candidates, make proposals, support matchmakers and contact you. We do not sell information or use it for advertising.'],
  },
  {
    title: '4. Who sees it',
    body: [
      'The system administrator sees all registrations and messages.',
      'Matchmakers approved by the administrator see candidate details as needed for matchmaking.',
      'Other candidates see only basic details in proposals (first initial, age, city, community, occupation and style), without surname or phone. Contact details are revealed only after mutual interest, with a matchmaker’s involvement.',
      'A matchmaker’s photo may be shown to users of the site.',
      'Candidates’ photos are reviewed by the system administrator. Until a photo is approved only the candidate and the administrator can see it.',
    ],
  },
  {
    title: '5. Where it is stored and how it is protected',
    body: [
      'Data is stored with infrastructure providers: Supabase (database and file storage) and Vercel (site hosting). Access is limited by role, and photos are kept in private storage.',
      'Messages typed to the chat assistant and the smart assistant may be sent to an AI service (Anthropic) to produce a reply. Do not write your full name, phone or identifying details in the chat.',
      'No system is completely secure. We take reasonable measures but cannot guarantee absolute protection.',
    ],
  },
  {
    title: '6. Retention and deletion',
    body: ['Data is kept while you are active. You can ask at any time to delete your profile and photo by phone or email above.'],
  },
  {
    title: '7. Your rights',
    body: ['You may ask to see the information we hold about you, to correct it, or to delete it. We will handle your request as soon as possible.'],
  },
  {
    title: '8. Browser storage',
    body: ['The site stores technical information in your browser that it needs to work, mainly your sign-in (candidates, matchmakers and admin) so you do not have to type your password on every visit. We do not use advertising cookies.'],
  },
  {
    title: '9. Changes',
    body: ['We will update this page when needed and the date at the top will change.'],
  },
]

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const sections = he ? HE : EN
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="hero-dark text-white text-center px-4 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{he ? 'מדיניות פרטיות' : 'Privacy Policy'}</h1>
        <p className="text-navy-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {he
            ? 'איזה מידע אנחנו אוספים, למה, מי רואה אותו, ואיך אפשר לבקש לעיין בו או למחוק אותו.'
            : 'What we collect, why, who sees it, and how you can ask to see or delete it.'}
        </p>
        <p className="text-navy-300 text-xs mt-4">{he ? 'עדכון אחרון: נובמבר 2026' : 'Last updated: November 2026'}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-[28px] bg-white shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy-800 mb-3">{s.title}</h2>
            <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-navy-700">
              {s.body.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
        ))}
        <p className="text-center text-sm text-navy-500">
          <Link href={`/${locale}/terms`} className="underline">{he ? 'תקנון ותנאי שימוש' : 'Terms of Service'}</Link>
          {' · '}
          <Link href={`/${locale}/contact`} className="underline">{he ? 'צור קשר' : 'Contact'}</Link>
        </p>
      </div>
    </div>
  )
}
