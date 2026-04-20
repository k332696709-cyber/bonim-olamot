import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { DonationsForm } from '@/components/ui/DonationsForm'
import { getT } from '@/lib/i18n/translations'

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const T = getT(locale)
  const isHe = locale === 'he'

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ══ Hero ══════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center px-4 py-16 text-center bg-white">
        <div className="max-w-2xl mx-auto w-full">

          {/* Logo */}
          <Logo size="lg" className="justify-center mb-6" />

          {/* Hero text */}
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-700 mb-2 leading-snug">
            {isHe ? 'ארגון בונים עולמות' : 'Bonim Olamot Organization'}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-12">
            {isHe ? 'אתר שידוכים מתקדם לקהילה החרדית' : 'Advanced matchmaking platform for the Haredi community'}
          </p>

          {/* Registration cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">

            {/* Male — מיועד */}
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
                <p className="font-bold text-navy-600 text-xl">{T.home.male}</p>
                <p className="text-gray-400 text-sm mt-1">{T.home.maleDesc}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-navy-50
                text-navy-500 text-sm font-semibold group-hover:bg-navy-100 transition-colors">
                {T.home.maleCta}
              </span>
            </Link>

            {/* Female — מיועדת */}
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
                <p className="font-bold text-burgundy-600 text-xl">{T.home.female}</p>
                <p className="text-gray-400 text-sm mt-1">{T.home.femaleDesc}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-burgundy-50
                text-burgundy-500 text-sm font-semibold group-hover:bg-burgundy-100 transition-colors">
                {T.home.femaleCta}
              </span>
            </Link>
          </div>

          {/* Matchmaker login link */}
          <div className="mt-10 text-sm text-gray-400">
            <Link href={`/${locale}/login`} className="hover:text-navy-500 transition-colors">
              {T.home.matchmakerLogin} →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ Donations Section (visible on scroll) ═════════════════════════════ */}
      <section id="donations" className="bg-gradient-to-b from-burgundy-50 to-white px-4 py-16 border-t border-burgundy-100">
        <div className="max-w-4xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-10">
            <span className="text-4xl">❤️</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy-800 mt-3 mb-2">
              {isHe ? 'תמוך בארגון בונים עולמות' : 'Support Bonim Olamot'}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              {isHe
                ? 'תרומתך עוזרת לנו לבנות עולמות, לשמח חתנים וכלות, ולתמוך בזוגות בדרכם'
                : 'Your donation helps us build worlds, bring joy to couples, and support families'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Causes mini-list */}
            <div className="flex flex-col gap-4">
              {[
                { icon: '💍', label: isHe ? 'סיוע לחתן וכלה' : 'Support for Chatan & Kallah' },
                { icon: '🕍', label: isHe ? 'פעילות הקהילה' : 'Community Activities' },
                { icon: '📚', label: isHe ? 'הכשרת שדכנים' : 'Matchmaker Training' },
                { icon: '🤝', label: isHe ? 'ייעוץ זוגי' : 'Couples Counseling' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white rounded-xl border border-burgundy-100 px-4 py-3 shadow-sm">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}

              <Link
                href={`/${locale}/donations`}
                className="mt-2 text-center py-3 rounded-xl border-2 border-burgundy-300 text-burgundy-700
                  font-semibold text-sm hover:bg-burgundy-50 transition-colors"
              >
                {isHe ? 'לדף התרומות המלא ←' : 'Full donation page →'}
              </Link>
            </div>

            {/* Inline quick-donate form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-luxury px-6 py-7">
              <h3 className="text-base font-bold text-center text-gray-700 mb-5">
                {isHe ? '⚡ תרומה מהירה' : '⚡ Quick Donate'}
              </h3>
              <DonationsForm locale={locale} compact />
            </div>
          </div>
        </div>
      </section>

      {/* ══ Footer ════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 py-5 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ארגון בונים עולמות
      </footer>
    </div>
  )
}
