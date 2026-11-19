import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { fetchPublishedEngagements } from '@/lib/engagements'
import { EngagementCard } from '@/components/engagements/EngagementCard'

export const dynamic = 'force-dynamic'

export default async function EngagementsPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const list = await fetchPublishedEngagements(60)
  return (
    <div dir={he ? 'rtl' : 'ltr'}>
      <PageHero
        title={he ? 'שידוכים שנסגרו, למזל טוב' : 'Matches made, mazal tov'}
        subtitle={he ? 'מודעות מאורסים מבונים עולמות. אפשר לפרסם גם את שלכם.' : 'Engagement announcements. You can add yours too.'}
      />
      <div className="max-w-5xl mx-auto px-4 py-10 pb-20">
        <div className="flex justify-center mb-8">
          <Link href={`/${locale}/engagements/new`} className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold inline-flex items-center">
            {he ? 'לעדכון מודעת מאורסים' : 'Announce an engagement'}
          </Link>
        </div>
        {list.length === 0 ? (
          <p className="text-center text-navy-500 py-10">{he ? 'עדיין אין מודעות.' : 'No announcements yet.'}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {list.map((e) => <EngagementCard key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
