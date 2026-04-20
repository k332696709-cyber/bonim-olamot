import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import { DonationsForm } from '@/components/ui/DonationsForm'
import { getT } from '@/lib/i18n/translations'
import { DATE_SPOTS_MOCK } from '@/constants/dateSpotsMockData'
import { CATEGORY_LABELS } from '@/types/dateSpots'

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const T = getT(locale)
  const isHe = locale === 'he'

  const previewSpots = DATE_SPOTS_MOCK.slice(0, 3)

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ══ 1. Candidates Section ══════════════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center px-4 py-16 text-center bg-white">
        <div className="max-w-2xl mx-auto w-full">

          <Logo size="lg" className="justify-center mb-6" />

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-700 mb-2 leading-snug">
            {isHe ? 'ארגון בונים עולמות' : 'Bonim Olamot Organization'}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-4">
            {isHe ? 'אתר שידוכים מתקדם לקהילה החרדית' : 'Advanced matchmaking platform for the Haredi community'}
          </p>

          {/* Section label */}
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-8">
            {isHe ? 'הרשמת מועמדים' : 'Candidate Registration'}
          </p>

          {/* Registration cards */}
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
                <p className="font-bold text-navy-600 text-xl">{T.home.male}</p>
                <p className="text-gray-400 text-sm mt-1">{T.home.maleDesc}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-navy-50
                text-navy-500 text-sm font-semibold group-hover:bg-navy-100 transition-colors">
                {T.home.maleCta}
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
                <p className="font-bold text-burgundy-600 text-xl">{T.home.female}</p>
                <p className="text-gray-400 text-sm mt-1">{T.home.femaleDesc}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-burgundy-50
                text-burgundy-500 text-sm font-semibold group-hover:bg-burgundy-100 transition-colors">
                {T.home.femaleCta}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 2. Donations Section ═══════════════════════════════════════════════ */}
      <section id="donations" className="bg-gradient-to-b from-burgundy-50 to-white px-4 py-16 border-t border-burgundy-100">
        <div className="max-w-4xl mx-auto">

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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-luxury px-6 py-7">
              <h3 className="text-base font-bold text-center text-gray-700 mb-5">
                {isHe ? '⚡ תרומה מהירה' : '⚡ Quick Donate'}
              </h3>
              <DonationsForm locale={locale} compact />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 3. Matchmaker Section ══════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">

          <span className="text-4xl">🤝</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 mt-3 mb-2">
            {isHe ? 'קורנר השדכנים' : 'Matchmaker Corner'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-10">
            {isHe
              ? 'שדכן/ית? הצטרפו לרשת השדכנים של בונים עולמות ועזרו לבנות עולמות'
              : 'Are you a matchmaker? Join our network and help build families'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">

            {/* Matchmaker Registration */}
            <Link
              href={`/${locale}/register/matchmaker`}
              className="group flex flex-col items-center gap-3 px-6 py-8 bg-navy-50 rounded-2xl
                border-2 border-navy-200 hover:border-navy-500 hover:bg-navy-100
                shadow-card hover:shadow-luxury transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-navy-100 group-hover:bg-navy-200 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-navy-700 text-lg">
                  {isHe ? 'הרשמת שדכנים' : 'Matchmaker Registration'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {isHe ? 'הצטרפו לרשת השדכנים' : 'Join our matchmaker network'}
                </p>
              </div>
            </Link>

            {/* Matchmaker Login */}
            <Link
              href={`/${locale}/login`}
              className="group flex flex-col items-center gap-3 px-6 py-8 bg-white rounded-2xl
                border-2 border-navy-300 hover:border-navy-600 hover:bg-navy-50
                shadow-card hover:shadow-luxury transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full bg-navy-100 group-hover:bg-navy-200 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-navy-700 text-lg">
                  {isHe ? 'כניסת שדכנים' : 'Matchmaker Login'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {isHe ? 'כניסה לאזור השדכנים' : 'Access matchmaker area'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 4. Dating Spots Preview ════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-4 py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-10">
            <span className="text-4xl">💑</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 mt-3 mb-2">
              {isHe ? 'מקומות לדייט' : 'Dating Spots'}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              {isHe
                ? 'מקומות מומלצים לפגישות שידוכים ברחבי הארץ'
                : 'Recommended venues for first dates across the country'}
            </p>
          </div>

          {/* Spot preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {previewSpots.map((spot) => {
              const cat = CATEGORY_LABELS[spot.category]
              return (
                <div key={spot.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden flex flex-col">
                  {/* Header band */}
                  <div className="bg-gradient-to-l from-navy-50 to-navy-100 px-4 py-2.5 flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-xs font-semibold text-navy-600 bg-white/70 rounded-full px-2.5 py-0.5">
                      {cat.he}
                    </span>
                    {spot.kosher && (
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-green-100 text-green-700 ms-auto">
                        ✓ כשר
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="px-4 py-4 flex flex-col gap-2 flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-navy-800 leading-snug">{spot.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {spot.city}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-xs ${i < Math.round(spot.averageRating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-xs text-gray-500 ms-1">{spot.averageRating}</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 flex-1">{spot.vibe}</p>

                    {/* Price */}
                    {spot.priceRange && (
                      <span className="text-xs text-gray-400 font-mono">{spot.priceRange}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* See all link */}
          <div className="text-center">
            <Link
              href={`/${locale}/date-spots`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-navy-600 text-white
                font-semibold text-sm hover:bg-navy-700 transition-colors shadow-card hover:shadow-luxury"
            >
              {isHe ? 'לכל המקומות ←' : 'View All Spots →'}
            </Link>
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
