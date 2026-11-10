import Link from 'next/link'
import { ProfileLoader } from '@/components/profile/ProfileLoader'
import { getT } from '@/lib/i18n/translations'

interface PageProps {
  params: { locale: string; id: string }
}

export default function MatchmakerProfilePage({ params: { locale, id } }: PageProps) {
  const T = getT(locale)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href={`/${locale}/matchmaker`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {T.profile.backToDashboard}
      </Link>

      <ProfileLoader locale={locale} id={id} />
    </div>
  )
}
