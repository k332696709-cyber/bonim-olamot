import Link from 'next/link'

export default function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'

  const generalTerms = isHe
    ? [
        'המועמד/ת מתחייב/ת שכל המידע שמסר/ה בטופס ההרשמה הוא אמיתי, מדויק ומלא.',
        'חל איסור מוחלט להעביר פרטים של מועמדים אחרים לגורמים שלישיים ללא אישור הארגון.',
        'המועמד/ת מתחייב/ת לנהוג בכבוד ובאדיבות כלפי כל הנוגעים בתהליך השידוך.',
        'שינויים בפרטים האישיים (מגורים, מצב אישי, תעסוקה) יעודכנו בהקדם האפשרי.',
        'הארגון שומר לעצמו את הזכות להסיר פרופיל שנמצא בו מידע כוזב או שימוש לרעה במערכת.',
        'השתתפות בתהליך השידוך מותנית בקבלת תנאים אלו במלואם.',
      ]
    : [
        'The candidate commits that all information provided in the registration form is truthful, accurate, and complete.',
        'It is strictly forbidden to pass other candidates\' details to third parties without the organization\'s approval.',
        'The candidate commits to acting with respect and courtesy toward all parties involved in the matchmaking process.',
        'Changes in personal details (residence, marital status, occupation) must be updated as soon as possible.',
        'The organization reserves the right to remove any profile found to contain false information or system misuse.',
        'Participation in the matchmaking process is conditional on full acceptance of these terms.',
      ]

  const privacyPoints = isHe
    ? [
        'פרטים אישיים נשמרים במערכת מאובטחת ואינם נחשפים לציבור.',
        'מידע על מועמד/ת יועבר לצד שני רק במסגרת הצעת שידוך ובהסכמת שני הצדדים.',
        'הארגון לא ימכור, ישכיר או ישתף מידע אישי עם גורמים מסחריים.',
        'מועמד/ת רשאי/ת לבקש מחיקת כל מידעם מהמערכת בכל עת.',
      ]
    : [
        'Personal details are stored in a secure system and are not exposed to the public.',
        'Information about a candidate will be passed to another party only as part of a match proposal and with both parties\' consent.',
        'The organization will not sell, rent, or share personal information with commercial entities.',
        'Candidates may request deletion of all their data from the system at any time.',
      ]

  const charterPoints = isHe
    ? [
        {
          icon: '🏅',
          title: 'נציגות ומחויבות',
          body: 'השדכן/ית הם נציגים רשמיים של הארגון ומחויבים לפעול על פי ערכיו, נהליו ואמנת האתיקה שלו בכל עת.',
        },
        {
          icon: '🔒',
          title: 'פרטיות וסודיות',
          body: 'שמירה על סודיות מוחלטת. פרטי מועמדים לא יועברו לאף גורם מחוץ למערכת. דיווח ייעשה אך ורק להנהלת הארגון.',
        },
        {
          icon: '💼',
          title: 'מקצועיות ואמינות',
          body: 'השדכן/ית מחויב/ת להציג מידע מדויק ומאומת בלבד. אין ללחוץ על מועמדים ואין להוסיף פרטים שאינם ידועים בוודאות.',
        },
        {
          icon: '🤝',
          title: 'ליווי מלא עד לסיום',
          body: 'השדכן/ית מתחייב/ת ללוות את המועמדים לאורך כל שלבי התהליך — מהצגת ההצעה ועד לסיומו, בין אם בהצלחה ובין אם לאו.',
        },
        {
          icon: '💰',
          title: 'שכר טרחה',
          body: 'דמי השידוך משולמים בהתאם לנהלי הארגון, ואך ורק במועד האירוסין. אין לדרוש תשלום כלשהו בשלבים קודמים לכך.',
        },
        {
          icon: '⚖️',
          title: 'יושרה ושוויון',
          body: 'כל מועמד ומועמדת יטופלו בשוויון ובכבוד, ללא אפליה על בסיס מוצא, מצב כלכלי או כל שיקול זר אחר.',
        },
      ]
    : [
        {
          icon: '🏅',
          title: 'Representation & Commitment',
          body: 'Matchmakers are official representatives of the organization and are committed to acting in accordance with its values, procedures, and code of ethics at all times.',
        },
        {
          icon: '🔒',
          title: 'Privacy & Confidentiality',
          body: 'Absolute confidentiality is maintained. Candidate details will not be passed to any party outside the system. Reporting is done exclusively to organizational management.',
        },
        {
          icon: '💼',
          title: 'Professionalism & Integrity',
          body: 'Matchmakers are committed to presenting only accurate, verified information. No pressure may be applied to candidates, and no unconfirmed details may be added.',
        },
        {
          icon: '🤝',
          title: 'Full Support Until Conclusion',
          body: 'Matchmakers commit to accompanying candidates through every stage of the process — from presenting the proposal until its conclusion, whether successful or not.',
        },
        {
          icon: '💰',
          title: 'Matchmaking Fees',
          body: 'Matchmaking fees are paid in accordance with organizational policy, and only upon engagement (Eirusin). No payment of any kind may be requested at prior stages.',
        },
        {
          icon: '⚖️',
          title: 'Integrity & Equality',
          body: 'Every candidate is treated with equality and dignity, without discrimination based on origin, financial status, or any other irrelevant consideration.',
        },
      ]

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy-800 mb-6 pb-3
      border-b-2 border-navy-100">
      {children}
    </h2>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-950 text-white text-center px-4 py-16 sm:py-20">
        <div className="text-5xl mb-5">📜</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 leading-tight">
          {isHe ? 'תקנון ותנאי שימוש' : 'Terms of Service & Code of Ethics'}
        </h1>
        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isHe
            ? 'מסמך זה מפרט את כללי הפעילות של הארגון, זכויות המועמדים ואמנת האתיקה של השדכנים.'
            : 'This document outlines the organization\'s operating rules, candidates\' rights, and the matchmakers\' code of ethics.'}
        </p>
        <p className="text-gray-500 text-xs mt-4">
          {isHe ? 'עדכון אחרון: ינואר 2026' : 'Last updated: January 2026'}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14 flex flex-col gap-14">

        {/* ── Section 1: General Terms ──────────────────────────── */}
        <section>
          <SectionTitle>
            {isHe ? '1. תנאים כלליים למועמדים' : '1. General Terms for Candidates'}
          </SectionTitle>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <ul className="flex flex-col gap-4">
              {generalTerms.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-navy-50 text-navy-700
                    flex items-center justify-center text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Section 2: Privacy ────────────────────────────────── */}
        <section>
          <SectionTitle>
            {isHe ? '2. מדיניות פרטיות' : '2. Privacy Policy'}
          </SectionTitle>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <ul className="flex flex-col gap-4">
              {privacyPoints.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="text-navy-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Section 3: Matchmaker Charter ─────────────────────── */}
        <section>
          <SectionTitle>
            {isHe ? '3. אמנת השדכניות' : '3. Matchmaker Code of Ethics'}
          </SectionTitle>

          {/* Intro callout */}
          <div className="bg-navy-50 border border-navy-200 rounded-2xl p-5 mb-6 flex gap-4 items-start">
            <span className="text-2xl shrink-0">ℹ️</span>
            <p className="text-sm text-navy-700 leading-relaxed">
              {isHe
                ? 'אמנה זו חלה על כל שדכן ושדכנית הפועלים בשם ארגון בונים עולמות. היא מפורסמת לידיעת הציבור כהתחייבות גלויה לסטנדרטים המקצועיים והמוסריים שלנו.'
                : 'This charter applies to every matchmaker acting on behalf of Bonim Olamot. It is published for public awareness as a transparent commitment to our professional and ethical standards.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {charterPoints.map((p) => (
              <div key={p.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-sm font-bold text-navy-700">{p.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Disclaimer ─────────────────────────────── */}
        <section>
          <SectionTitle>
            {isHe ? '4. הגבלת אחריות' : '4. Limitation of Liability'}
          </SectionTitle>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8
            text-sm text-gray-500 leading-relaxed flex flex-col gap-3">
            <p>
              {isHe
                ? 'הארגון אינו אחראי לתוצאות תהליך השידוך ואינו מבטיח התאמה מוצלחת. הארגון פועל כמתווך בלבד ואין ביכולתו לחייב אף צד לקבל הצעה.'
                : 'The organization is not responsible for the outcomes of the matchmaking process and does not guarantee a successful match. The organization acts as an intermediary only and cannot compel any party to accept a proposal.'}
            </p>
            <p>
              {isHe
                ? 'הארגון רשאי לעדכן תקנון זה בכל עת. שינויים מהותיים יפורסמו באתר. המשך שימוש בשירותי הארגון לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים.'
                : 'The organization may update these terms at any time. Material changes will be published on the website. Continued use of the organization\'s services after the publication of changes constitutes acceptance of the updated terms.'}
            </p>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────── */}
        <div className="bg-navy-700 text-white rounded-2xl p-6 sm:p-8 text-center flex flex-col gap-3">
          <h2 className="font-serif font-bold text-lg">
            {isHe ? 'שאלות?' : 'Questions?'}
          </h2>
          <p className="text-navy-200 text-sm leading-relaxed">
            {isHe
              ? 'לכל שאלה בנוגע לתקנון, לפרטיות או לאמנת השדכניות, ניתן ליצור קשר עם הארגון.'
              : 'For any questions regarding these terms, privacy, or the matchmakers\' charter, please contact the organization.'}
          </p>
          <Link href={`/${locale}/contact`}
            className="mt-1 inline-block px-6 py-2.5 bg-white text-navy-800 rounded-xl
              text-sm font-semibold hover:bg-navy-50 transition-colors self-center">
            {isHe ? 'צור קשר' : 'Contact Us'}
          </Link>
        </div>

      </div>

      {/* Back link */}
      <div className="text-center pb-12">
        <Link href={`/${locale}`}
          className="text-sm text-gray-400 hover:text-navy-500 transition-colors">
          {isHe ? '← חזרה לדף הבית' : '← Back to home'}
        </Link>
      </div>
    </div>
  )
}
