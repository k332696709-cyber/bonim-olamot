import { PageHero } from '@/components/layout/PageHero'
import { EngagementForm } from '@/components/engagements/EngagementForm'

export default function NewEngagementPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  return (
    <div dir={he ? 'rtl' : 'ltr'}>
      <PageHero
        title={he ? 'לעדכון מודעת מאורסים' : 'Announce an engagement'}
        subtitle={he ? 'ממלאים את הפרטים, ואחרי אישור המודעה תופיע בדף הבית.' : 'Fill in the details. After approval the announcement appears on the home page.'}
      />
      <div className="max-w-2xl mx-auto px-4 py-10 pb-20">
        <EngagementForm locale={locale} />
      </div>
    </div>
  )
}
