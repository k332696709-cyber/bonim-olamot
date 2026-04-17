import Link from 'next/link'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { CompatibilityPanel } from '@/components/profile/CompatibilityPanel'
import { MaleProfileCard } from '@/components/profile/MaleProfileCard'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import { getT } from '@/lib/i18n/translations'

interface PageProps {
  params: { locale: string; id: string }
}

export default function MatchmakerProfilePage({ params: { locale, id } }: PageProps) {
  const T = getT(locale)

  const femaleProfile = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
  const maleProfile   = MOCK_MALE_PROFILES.find((p) => p.id === id)
  const profileName   = femaleProfile?.firstName ?? maleProfile?.firstName ?? id

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href={`/${locale}/matchmaker`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {T.profile.backToDashboard}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-serif font-bold text-navy-600">
          {femaleProfile ? T.profile.femaleTitle : T.profile.maleTitle}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {profileName} · {T.profile.lastNamePhone}
        </p>
      </div>

      {femaleProfile ? (
        <>
          <ProfileCard profile={femaleProfile} locale={locale} />
          <div className="mt-6">
            <CompatibilityPanel
              currentProfile={femaleProfile}
              currentGender="female"
              candidates={MOCK_MALE_PROFILES}
              locale={locale}
            />
          </div>
        </>
      ) : maleProfile ? (
        <>
          <MaleProfileCard
            profile={maleProfile}
            locale={locale}
            femaleCandidates={MOCK_FEMALE_PROFILES}
          />
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          {T.profile.notFound}
        </div>
      )}
    </div>
  )
}
