import Link from 'next/link'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AISummary } from '@/components/profile/AISummary'
import { CompatibilityPanel } from '@/components/profile/CompatibilityPanel'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import type { MaleProfile } from '@/types/registration'
import {
  MALE_STYLE_OPTIONS,
  TRAIT_OPTIONS_MALE,
  MALE_CLOTHING_OPTIONS,
  MALE_PARTNER_CLOTHING_OPTIONS,
  PHONE_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '@/constants/formOptions'

interface PageProps {
  params: { locale: string; id: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLabel(options: { value: string; he: string; en: string }[], value: string, locale: string) {
  const opt = options.find((o) => o.value === value)
  if (!opt) return value
  return locale === 'he' ? opt.he : opt.en
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm shrink-0 w-40">{label}</span>
      <span className="text-gray-900 text-sm font-medium flex-1">{value}</span>
    </div>
  )
}

// ─── Male profile display ─────────────────────────────────────────────────────

function MaleProfileView({
  profile, locale, femaleCandidates,
}: { profile: MaleProfile; locale: string; femaleCandidates: typeof MOCK_FEMALE_PROFILES }) {
  const t = locale === 'he'

  const traitLabels = profile.traits
    .map((trait) => getLabel(TRAIT_OPTIONS_MALE, trait, locale))
    .join(' · ')

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-luxury border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-navy-500 to-navy-700 px-6 py-5">
          <h1 className="text-white text-xl font-serif font-bold">
            {profile.firstName}
            <span className="text-navy-200 text-base font-normal ms-2">
              {t ? '(שם משפחה מוסתר)' : '(last name hidden)'}
            </span>
          </h1>
          <p className="text-navy-200 text-sm mt-1">
            {t ? 'גיל' : 'Age'}: {profile.age} · {profile.city}
          </p>
        </div>
        <div className="px-6 py-4">
          <FieldRow label={t ? 'תאריך לידה עברי' : 'Hebrew Birthday'} value={profile.hebrewBirthday} />
          <FieldRow
            label={t ? 'מצב משפחתי' : 'Marital Status'}
            value={getLabel(MARITAL_STATUS_OPTIONS, profile.status, locale)}
          />
          <FieldRow label={t ? 'קהילה' : 'Community'} value={profile.community} />
          <FieldRow label={t ? 'עיסוק' : 'Occupation'} value={profile.occupation} />
          <FieldRow label={t ? 'דוא"ל' : 'Email'} value={profile.email} />
          <FieldRow
            label={t ? 'טלפון' : 'Phone'}
            value={<span className="text-gray-400 italic">{t ? '(מוסתר)' : '(hidden)'}</span>}
          />
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">
          {t ? 'פרטי פרופיל' : 'Profile Details'}
        </h2>
        <FieldRow
          label={t ? 'סגנון' : 'Style'}
          value={getLabel(MALE_STYLE_OPTIONS, profile.style, locale)}
        />
        <FieldRow
          label={t ? 'תכונות אופי' : 'Traits'}
          value={
            <div className="flex flex-wrap gap-1.5">
              {profile.traits.map((trait) => (
                <span
                  key={trait}
                  className="bg-navy-50 text-navy-600 text-xs px-2.5 py-1 rounded-full border border-navy-100 font-medium"
                >
                  {getLabel(TRAIT_OPTIONS_MALE, trait, locale)}
                </span>
              ))}
            </div>
          }
        />
        <FieldRow
          label={t ? 'סגנון לבוש' : 'Clothing'}
          value={getLabel(MALE_CLOTHING_OPTIONS, profile.clothing, locale)}
        />
        <FieldRow
          label={t ? 'לבוש בת זוג רצויה' : 'Partner Clothing'}
          value={getLabel(MALE_PARTNER_CLOTHING_OPTIONS, profile.partnerClothing, locale)}
        />
        <FieldRow
          label={t ? 'סוג טלפון' : 'Phone Type'}
          value={getLabel(PHONE_TYPE_OPTIONS, profile.phoneType, locale)}
        />
      </div>

      {/* AI Summary */}
      <AISummary profile={profile} gender="male" locale={locale} />

      {/* Compatibility Engine */}
      <CompatibilityPanel
        currentProfile={profile}
        currentGender="male"
        candidates={femaleCandidates}
        locale={locale}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchmakerProfilePage({ params: { locale, id } }: PageProps) {
  const t = locale === 'he'

  const femaleProfile = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
  const maleProfile   = MOCK_MALE_PROFILES.find((p) => p.id === id)

  const profileName = femaleProfile?.firstName ?? maleProfile?.firstName ?? id

  return (
    <div className="max-w-3xl mx-auto px-4 py-10" dir={t ? 'rtl' : 'ltr'}>
      {/* Back link */}
      <Link
        href={`/${locale}/matchmaker`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t ? 'חזרה ללוח הבקרה' : 'Back to Dashboard'}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-serif font-bold text-navy-600">
          {femaleProfile
            ? (t ? 'תצוגת שדכן – מיועדת' : 'Matchmaker View – Female Candidate')
            : (t ? 'תצוגת שדכן – מיועד' : 'Matchmaker View – Male Candidate')}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {profileName} · {t ? 'שם משפחה וטלפון מוסתרים' : 'Last name and phone hidden'}
        </p>
      </div>

      {femaleProfile ? (
        <>
          <ProfileCard profile={femaleProfile} locale={locale} />
          <CompatibilityPanel
            currentProfile={femaleProfile}
            currentGender="female"
            candidates={MOCK_MALE_PROFILES}
            locale={locale}
          />
        </>
      ) : maleProfile ? (
        <MaleProfileView
          profile={maleProfile}
          locale={locale}
          femaleCandidates={MOCK_FEMALE_PROFILES}
        />
      ) : (
        <div className="text-center py-16 text-gray-400">
          {t ? 'פרופיל לא נמצא' : 'Profile not found'}
        </div>
      )}
    </div>
  )
}
