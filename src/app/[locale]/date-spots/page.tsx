import Link from 'next/link'
import { fetchPublishedSpots } from '@/lib/dateSpots'
import { PageHero } from '@/components/layout/PageHero'
import { DateSpotsClient } from '@/components/date-spots/DateSpotsClient'

export const dynamic = 'force-dynamic'

export default async function DateSpotsPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'
  const spots = await fetchPublishedSpots()

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Hero header ── */}
      <PageHero
        title={isHe ? 'מנוע חיפוש מקומות לדייטים' : 'Date-Spot Finder'}
        subtitle={isHe
          ? 'מצאו את המקום המושלם לפגישה ראשונה: מסעדות, לוביות מלון, פארקים ומקומות שקטים ברחבי הארץ'
          : 'Find the perfect spot for a first date across Israel'}
        chips={isHe ? ['בני ברק', 'אשדוד', 'חיפה', 'ירושלים', 'לובי מלון'] : ['Bnei Brak', 'Ashdod', 'Haifa', 'Jerusalem', 'Hotel lobby']}
      >
        <div className="flex items-center justify-center gap-8 text-sm text-navy-200">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{spots.length}</span>
            <span>{isHe ? 'מקומות' : 'Spots'}</span>
          </div>
          <div className="w-px h-8 bg-navy-600" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">17</span>
            <span>{isHe ? 'אזורים' : 'Regions'}</span>
          </div>
          <div className="w-px h-8 bg-navy-600" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-white">5</span>
            <span>{isHe ? 'קטגוריות' : 'Categories'}</span>
          </div>
        </div>
      </PageHero>

      {/* ── Tips strip ── */}
      <div className="bg-burgundy-600 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap justify-center text-sm">
          <span className="font-bold">{isHe ? 'טיפ:' : 'Tip:'}</span>
          <span>
            {isHe
              ? 'לפגישה ראשונה — לובי מלון או בית קפה שקט. לפגישות מתקדמות — מסעדת שף או טיול בטבע.'
              : 'For a first date — a hotel lobby or quiet café. For later dates — a chef restaurant or nature walk.'}
          </span>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <DateSpotsClient spots={spots} locale={locale} />
      </main>

      {/* ── Footer CTA ── */}
      <div className="border-t border-gray-200 bg-white py-10 text-center px-4">
        <p className="text-gray-600 text-sm mb-4">
          {isHe ? 'יודע על מקום מעולה שלא מופיע כאן?' : 'Know a great spot not listed here?'}
        </p>
        <a
          href="mailto:b.w008833@gmail.com?subject=הצעת מקום לדייט"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-800 hover:bg-navy-700
            text-white text-sm font-semibold transition-colors"
        >
          {isHe ? 'שלח הצעה' : 'Suggest a spot'}
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
