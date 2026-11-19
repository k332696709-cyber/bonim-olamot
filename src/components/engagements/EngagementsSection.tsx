import Link from 'next/link'
import { fetchPublishedEngagements } from '@/lib/engagements'
import { EngagementCard } from '@/components/engagements/EngagementCard'

/** "Closed matches" on the home page, in the site's own section style. */
export async function EngagementsSection({ locale }: { locale: string }) {
  const list = await fetchPublishedEngagements(3)
  const he = locale === 'he'
  return (
    <section className="px-4 py-20 sm:py-28 bg-white" dir={he ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest text-burgundy-500 mb-3">
            {he ? 'שידוכים שנסגרו' : 'MATCHES MADE'}
          </p>
          <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
            <span className="font-light">{he ? 'מזל ' : 'Mazal '}</span>
            <span className="font-bold">{he ? 'טוב.' : 'tov.'}</span>
          </h2>
          <p className="text-navy-500 text-base sm:text-lg max-w-lg mx-auto mt-3">
            {he ? 'מודעות מאורסים מבונים עולמות. אפשר לפרסם גם את שלכם.' : 'Engagement announcements. You can add yours too.'}
          </p>
        </div>

        {list.length === 0 ? (
          <div className="rounded-[28px] bg-[#f1f1f1] p-10 text-center text-navy-500">
            {he ? 'כאן יופיעו מודעות מאורסים. נשמח לפרסם גם את שלכם.' : 'Engagement announcements will appear here.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {list.map((e) => <EngagementCard key={e.id} e={e} />)}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <Link
            href={`/${locale}/engagements`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-bold px-8 transition-colors"
          >
            {he ? 'לכל מה שחדש' : 'See all'}
          </Link>
          <Link
            href={`/${locale}/engagements/new`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-sm font-bold px-8 transition-colors"
          >
            {he ? 'לעדכון מודעת מאורסים' : 'Announce an engagement'}
          </Link>
        </div>
      </div>
    </section>
  )
}
