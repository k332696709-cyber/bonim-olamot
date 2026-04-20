import Link from 'next/link'
import { DonationsForm } from '@/components/ui/DonationsForm'

export default function DonationsPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'

  const causes = [
    {
      icon: '💍',
      title: isHe ? 'סיוע לחתן וכלה' : 'Support for Chatan & Kallah',
      desc: isHe ? 'עזרה לזוגות מתחתנים במצב כלכלי קשה' : 'Help for couples getting married in financial difficulty',
    },
    {
      icon: '🕍',
      title: isHe ? 'פעילות הקהילה' : 'Community Activities',
      desc: isHe ? 'מימון אירועי שידוכים וכנסי הכרות' : 'Funding matchmaking events and introduction conferences',
    },
    {
      icon: '📚',
      title: isHe ? 'הכשרת שדכנים' : 'Matchmaker Training',
      desc: isHe ? 'הכשרה מקצועית לשדכנים חדשים' : 'Professional training for new matchmakers',
    },
    {
      icon: '🤝',
      title: isHe ? 'ייעוץ זוגי' : 'Couples Counseling',
      desc: isHe ? 'מימון ייעוץ לזוגות זקוקים' : 'Funding counseling for couples in need',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <div className="bg-gradient-to-b from-burgundy-700 to-burgundy-900 text-white text-center px-4 py-14">
        <div className="text-5xl mb-4">❤️</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
          {isHe ? 'תרומה לארגון בונים עולמות' : 'Donate to Bonim Olamot'}
        </h1>
        <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">
          {isHe
            ? 'כל תרומה עוזרת לנו לבנות עולמות חדשים ולשמח לבבות'
            : 'Every donation helps us build new worlds and bring joy to hearts'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — causes */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-navy-700 font-serif mb-1">
                {isHe ? 'לאן הולכת תרומתך?' : 'Where does your donation go?'}
              </h2>
              <p className="text-sm text-gray-500">
                {isHe
                  ? '100% מהתרומות מגיעות ישירות לפעילות הארגון'
                  : '100% of donations go directly to organizational activities'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {causes.map((c) => (
                <div key={c.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex gap-3 items-start">
                  <span className="text-2xl shrink-0">{c.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-navy-700">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="bg-navy-50 border border-navy-100 rounded-2xl px-5 py-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-navy-600 mb-1">
                {isHe ? 'אנחנו מחויבים לשקיפות' : 'We are committed to transparency'}
              </p>
              {[
                isHe ? '✓ ארגון רשום ומפוקח' : '✓ Registered and regulated organization',
                isHe ? '✓ דוחות כספיים שנתיים פומביים' : '✓ Public annual financial reports',
                isHe ? '✓ אישור מוסד ציבורי לתרומות' : '✓ Public institution approval for donations',
              ].map((t) => (
                <p key={t} className="text-xs text-navy-500">{t}</p>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-luxury px-6 sm:px-8 py-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
              {isHe ? 'פרטי התרומה' : 'Donation Details'}
            </h2>
            <DonationsForm locale={locale} />
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="text-center pb-10">
        <Link href={`/${locale}`} className="text-sm text-gray-400 hover:text-navy-500 transition-colors">
          {isHe ? '← חזרה לדף הבית' : '← Back to home'}
        </Link>
      </div>
    </div>
  )
}
