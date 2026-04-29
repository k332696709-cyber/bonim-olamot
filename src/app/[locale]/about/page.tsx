import Link from 'next/link'

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'

  const values = [
    {
      icon: '🕊️',
      title:    isHe ? 'יראת שמיים'          : 'Heavenly Fear',
      subtitle: isHe ? 'Torah-guided matching' : 'Torah-guided matching',
      desc: isHe
        ? 'כל שידוך מתנהל מתוך מודעות עמוקה לחשיבות המעשה. אנו רואים בכל זוג עולם ומלואו, ופועלים מתוך יראת שמיים אמיתית.'
        : 'Every match is guided by a deep awareness of its sacred significance. We see each couple as an entire world, and act with genuine reverence.',
    },
    {
      icon: '🤝',
      title:    isHe ? 'כבוד האדם'     : 'Human Dignity',
      subtitle: isHe ? 'Every person matters' : 'Every person matters',
      desc: isHe
        ? 'כל מועמד ומועמדת הם בראש ובראשונה בני אדם עם כבוד, תקוות וחלומות. אנו מתחייבים ליחס שוויוני, מכבד ואנושי בכל שלב.'
        : 'Every candidate is first and foremost a person with dignity, hopes, and dreams. We commit to fair, respectful, and humane treatment at every stage.',
    },
    {
      icon: '🔒',
      title:    isHe ? 'דיסקרטיות מוחלטת' : 'Absolute Discretion',
      subtitle: isHe ? 'Your privacy is sacred' : 'Your privacy is sacred',
      desc: isHe
        ? 'פרטי המועמדים מוגנים בקפידה. מידע אישי לא יועבר לשום גורם ללא הסכמה מפורשת. הדיסקרטיות היא ערך יסוד, לא אפשרות.'
        : 'Candidate details are guarded with care. Personal information is never shared without explicit consent. Discretion is a core value, not an option.',
    },
  ]

  const steps = [
    {
      n: '01',
      title: isHe ? 'הרשמה ויצירת פרופיל'    : 'Register & Create Profile',
      desc:  isHe ? 'המועמד/ת ממלאים שאלון מפורט הכולל ערכים, אופי ואורח חיים.'
                  : 'Candidates complete a detailed questionnaire covering values, character, and lifestyle.',
    },
    {
      n: '02',
      title: isHe ? 'סקירה אישית על ידי שדכן/ית' : 'Personal Review by a Matchmaker',
      desc:  isHe ? 'שדכן/ית מוסמך/ת עוברים על הפרופיל ומתאימים מועמדים עם ראייה מקצועית.'
                  : 'A certified matchmaker reviews the profile and finds compatible candidates with professional insight.',
    },
    {
      n: '03',
      title: isHe ? 'הצעת שידוך'       : 'Match Proposal',
      desc:  isHe ? 'הצעה מוצגת לשני הצדדים בדיסקרטיות ובכבוד. כל הכרעה — בידי המועמד/ת.'
                  : 'The proposal is presented to both parties with discretion and respect. Every decision belongs to the candidate.',
    },
    {
      n: '04',
      title: isHe ? 'ליווי עד לסיום'   : 'Support Until Conclusion',
      desc:  isHe ? 'אנו עומדים לצד המועמדים לאורך כל התהליך — עד לסיום מוצלח.'
                  : 'We stand by candidates throughout the entire process — until a successful conclusion.',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-navy-900 to-navy-950 text-white text-center px-4 py-16 sm:py-20">
        <div className="text-5xl mb-5">🏡</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 leading-tight">
          {isHe ? 'אודות בונים עולמות' : 'About Bonim Olamot'}
        </h1>
        <p className="text-white font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isHe
            ? 'ארגון שידוכים מקצועי, ערכי ואנושי — המחויב לבניית בתים יהודיים על אדני אמת, כבוד ויראת שמיים.'
            : 'A professional, values-driven matchmaking organization — committed to building Jewish homes on foundations of truth, dignity, and reverence.'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-16">

        {/* ── Mission ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-navy-800 mb-5">
            {isHe ? 'מי אנחנו' : 'Who We Are'}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 leading-relaxed text-gray-700 text-[15px] flex flex-col gap-4">
            <p>
              {isHe
                ? 'בונים עולמות הוא ארגון שידוכים מקצועי המשרת את הקהילה החרדית בישראל. הארגון הוקם מתוך הכרה עמוקה ששידוך הוא מהמעשים הנעלים ביותר שאדם יכול לעשות — בניית עולם חדש.'
                : 'Bonim Olamot is a professional matchmaking organization serving the Haredi community in Israel. The organization was founded from a deep recognition that matchmaking is among the most elevated acts a person can perform — building a new world.'}
            </p>
            <p>
              {isHe
                ? 'הצוות שלנו מורכב משדכנים ושדכניות מוסמכים, המחויבים לאמנת הארגון ולעקרונות מקצועיים ואתיים ברורים. אנו מאמינים שכל אדם ראוי לתהליך שידוך מכבד, שקוף ואישי.'
                : 'Our team consists of certified matchmakers, committed to the organization\'s charter and clear professional and ethical principles. We believe every person deserves a respectful, transparent, and personal matchmaking process.'}
            </p>
            <p>
              {isHe
                ? 'מאות זוגות בנו את ביתם בעזרת בונים עולמות. כל שידוך הוא עולם ומלואו — ואנו גאים להיות שותפים לבנייתו.'
                : 'Hundreds of couples have built their homes with the help of Bonim Olamot. Each match is an entire world — and we are proud to be partners in building it.'}
            </p>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-navy-800 mb-5">
            {isHe ? 'הערכים שלנו' : 'Our Values'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
                <span className="text-4xl">{v.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-navy-700">{v.title}</h3>
                  <p className="text-xs text-navy-400 font-medium mt-0.5">{v.subtitle}</p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-navy-800 mb-5">
            {isHe ? 'איך זה עובד' : 'How It Works'}
          </h2>
          <div className="flex flex-col gap-4">
            {steps.map((s) => (
              <div key={s.n}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex gap-5 items-start">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-navy-700 text-white flex items-center
                  justify-center text-xs font-bold font-mono">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-700 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="bg-navy-700 text-white rounded-2xl p-8 sm:p-10 text-center flex flex-col gap-4">
          <h2 className="text-xl sm:text-2xl font-serif font-bold">
            {isHe ? 'מוכנים להתחיל?' : 'Ready to Begin?'}
          </h2>
          <p className="text-navy-200 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {isHe
              ? 'הצטרפו לאלפי מועמדים שבוטחים בבונים עולמות להוביל אותם למציאת זיווגם.'
              : 'Join thousands of candidates who trust Bonim Olamot to guide them to their match.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <Link href={`/${locale}/register/female`}
              className="px-6 py-3 bg-white text-navy-800 rounded-xl font-semibold text-sm
                hover:bg-navy-50 transition-colors">
              {isHe ? 'הרשמה למיועדת' : 'Register – Female'}
            </Link>
            <Link href={`/${locale}/register/male`}
              className="px-6 py-3 bg-navy-600 text-white rounded-xl font-semibold text-sm
                border border-navy-500 hover:bg-navy-500 transition-colors">
              {isHe ? 'הרשמה למיועד' : 'Register – Male'}
            </Link>
          </div>
        </section>

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
