import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = locale === 'he'

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <Logo size="lg" className="justify-center mb-8" />

          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-navy-500 mb-3 leading-tight">
            {t ? 'בונים עולמות' : 'Bonim Olamot'}
          </h1>
          <p className="text-lg text-gray-500 mb-12">
            {t ? 'שידוכים בדרך האמת' : 'Matchmaking with integrity'}
          </p>

          {/* Two entry points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Male */}
            <Link
              href={`/${locale}/register/male`}
              className="group flex flex-col items-center gap-3 px-6 py-8 bg-white rounded-2xl
                border-2 border-navy-100 hover:border-navy-400 shadow-card hover:shadow-luxury
                transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-navy-50 group-hover:bg-navy-100 flex items-center justify-center transition-colors">
                <svg className="w-7 h-7 text-navy-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-navy-600 text-lg">{t ? 'מיועד' : 'Male Candidate'}</p>
                <p className="text-gray-400 text-sm mt-0.5">{t ? 'טופס הרשמה לבחור' : 'Registration for men'}</p>
              </div>
              <span className="text-navy-400 text-sm font-medium group-hover:text-navy-600">
                {t ? 'להרשמה ←' : 'Register →'}
              </span>
            </Link>

            {/* Female */}
            <Link
              href={`/${locale}/register/female`}
              className="group flex flex-col items-center gap-3 px-6 py-8 bg-white rounded-2xl
                border-2 border-burgundy-100 hover:border-burgundy-400 shadow-card hover:shadow-luxury
                transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-burgundy-50 group-hover:bg-burgundy-100 flex items-center justify-center transition-colors">
                <svg className="w-7 h-7 text-burgundy-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-burgundy-600 text-lg">{t ? 'מיועדת' : 'Female Candidate'}</p>
                <p className="text-gray-400 text-sm mt-0.5">{t ? 'טופס הרשמה לבחורה' : 'Registration for women'}</p>
              </div>
              <span className="text-burgundy-400 text-sm font-medium group-hover:text-burgundy-600">
                {t ? 'להרשמה ←' : 'Register →'}
              </span>
            </Link>
          </div>

          <div className="mt-10 text-sm text-gray-400">
            <Link href={`/${locale}/matchmaker`} className="hover:text-navy-500 transition-colors">
              {t ? 'כניסת שדכן' : 'Matchmaker Login'} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} בונים עולמות
      </footer>
    </div>
  )
}
