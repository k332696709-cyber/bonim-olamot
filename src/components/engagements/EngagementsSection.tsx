import Link from 'next/link'
import { fetchPublishedEngagements } from '@/lib/engagements'
import { EngagementCard } from '@/components/engagements/EngagementCard'

/** "Closed matches" on the home page: the latest announcements and buttons to see all or to add one. */
export async function EngagementsSection({ locale }: { locale: string }) {
  const list = (await fetchPublishedEngagements(3))
  const he = locale === 'he'
  const btn = 'h-12 px-6 rounded-full border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 text-sm font-semibold inline-flex items-center justify-center'
  return (
    <section className="px-4 py-16 sm:py-20 bg-[#eef1f3]" dir={he ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <h2 className="leading-tight">
            <span className="block text-3xl sm:text-5xl font-bold text-navy-800">{he ? 'שידוכים שנסגרו' : 'Matches made'}</span>
            <span className="inline-block mt-3 rounded-2xl bg-navy-800 text-white text-3xl sm:text-5xl font-bold px-5 py-2 -rotate-2">
              {he ? 'למזל טוב' : 'Mazal tov'}
            </span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/engagements`} className={btn}>{he ? 'לכל מה שחדש' : 'See all'}</Link>
            <Link href={`/${locale}/engagements/new`} className={btn}>{he ? 'לעדכון מודעת מאורסים' : 'Announce an engagement'}</Link>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-[28px] bg-white border border-navy-100 p-10 text-center text-navy-500">
            {he ? 'כאן יופיעו מודעות מאורסים. נשמח לפרסם גם את שלכם.' : 'Engagement announcements will appear here.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {list.map((e) => <EngagementCard key={e.id} e={e} />)}
          </div>
        )}
      </div>
    </section>
  )
}
