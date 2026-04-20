import Link from 'next/link'
import { DATE_SPOTS_MOCK } from '@/constants/dateSpotsMockData'
import { DateSpotsClient } from '@/components/date-spots/DateSpotsClient'

// TODO: Replace with real data fetching when Supabase is connected:
// const spots = await supabase.from('date_spots').select('*, reviews(*)')

export default function DateSpotsPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'

  return (
    <div className="min-h-screen bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-b from-navy-800 to-navy-900 text-white px-4 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-4">💑</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            {isHe ? 'מנוע חיפוש מקומות לדייטים' : 'Date-Spot Finder'}
          </h1>
          <p className="text-navy-200 text-base sm:text-lg max-w-xl mx-auto">
            {isHe
              ? 'מצאו את המקום המושלם לפגישה ראשונה — מסעדות, לוביות מלון, פארקים ומקומות שקטים ברחבי הארץ'
              : 'Find the perfect spot for a first date across Israel'}
          </p>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-navy-300">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">{DATE_SPOTS_MOCK.length}</span>
              <span>מקומות</span>
            </div>
            <div className="w-px h-8 bg-navy-600" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">4</span>
              <span>אזורים</span>
            </div>
            <div className="w-px h-8 bg-navy-600" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">4</span>
              <span>קטגוריות</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tips strip ── */}
      <div className="bg-burgundy-600 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap justify-center text-sm">
          <span className="font-bold">💡 טיפ:</span>
          <span>לפגישה ראשונה — לובי מלון או בית קפה שקט. לפגישות מתקדמות — מסעדת שף או טיול בטבע.</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <DateSpotsClient spots={DATE_SPOTS_MOCK} />
      </main>

      {/* ── Footer CTA ── */}
      <div className="border-t border-gray-200 bg-white py-10 text-center px-4">
        <p className="text-gray-600 text-sm mb-4">
          {isHe ? 'יודע על מקום מעולה שלא מופיע כאן?' : 'Know a great spot not listed here?'}
        </p>
        <a
          href="mailto:info@bonim-olamot.co.il?subject=הצעת מקום לדייט"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700
            text-white text-sm font-semibold transition-colors"
        >
          📬 {isHe ? 'שלח הצעה' : 'Suggest a spot'}
        </a>
        <div className="mt-6">
          <Link href={`/${locale}`} className="text-xs text-gray-400 hover:text-navy-500 transition-colors">
            {isHe ? '← חזרה לדף הבית' : '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
