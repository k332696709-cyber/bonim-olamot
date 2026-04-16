'use client'

import { useState } from 'react'
import type { FemaleProfile, MatchmakerStatus, Note } from '@/types/registration'
import { TrafficLight } from './TrafficLight'
import { LockIndicator } from './LockIndicator'
import { NotesThread } from './NotesThread'
import { PdfExportButton } from './PdfExportButton'
import { AISummary } from './AISummary'
import {
  FEMALE_STYLE_OPTIONS,
  TRAIT_OPTIONS_FEMALE,
  FEMALE_CLOTHING_OPTIONS,
  HEADCOVERING_OPTIONS,
  FEMALE_PARTNER_CLOTHING_OPTIONS,
  PHONE_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '@/constants/formOptions'

interface ProfileCardProps {
  profile: FemaleProfile
  locale?: string
}

function getLabel<T extends string>(
  options: { value: T; he: string; en: string }[],
  value: T,
  locale: string
): string {
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

export function ProfileCard({ profile, locale = 'he' }: ProfileCardProps) {
  const [status, setStatus] = useState<MatchmakerStatus>(profile.matchmakerStatus)
  const [lockedAt, setLockedAt] = useState<Date | null>(profile.lockedAt)
  const [notes, setNotes] = useState<Note[]>(profile.notes)
  const t = locale === 'he'

  const handleAddNote = (text: string) => {
    const note: Note = {
      id: Date.now().toString(),
      author: t ? 'שדכן' : 'Matchmaker',
      text,
      createdAt: new Date(),
    }
    setNotes((prev) => [...prev, note])
  }

  const handleLock = () => {
    setLockedAt(new Date())
  }

  const traitLabels = profile.traits
    .map((trait) => getLabel(TRAIT_OPTIONS_FEMALE, trait, locale))
    .join(' · ')

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-luxury border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-l from-navy-500 to-navy-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white text-xl font-serif font-bold">
                {profile.firstName}
                <span className="text-navy-200 text-base font-normal ms-2">
                  {t ? '(שם משפחה מוסתר)' : '(last name hidden)'}
                </span>
              </h1>
              <p className="text-navy-200 text-sm mt-1">
                {t ? 'גיל' : 'Age'}: {profile.age}
                {' · '}
                {profile.city}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <TrafficLight status={status} locale={locale} onChange={setStatus} />
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="px-6 py-4">
          <FieldRow label={t ? 'תאריך לידה עברי' : 'Hebrew Birthday'} value={profile.hebrewBirthday} />
          <FieldRow
            label={t ? 'מצב משפחתי' : 'Marital Status'}
            value={getLabel(MARITAL_STATUS_OPTIONS, profile.status as never, locale)}
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

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">
          {t ? 'פרטי פרופיל' : 'Profile Details'}
        </h2>
        <FieldRow
          label={t ? 'סגנון' : 'Style'}
          value={getLabel(FEMALE_STYLE_OPTIONS, profile.style, locale)}
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
                  {getLabel(TRAIT_OPTIONS_FEMALE, trait, locale)}
                </span>
              ))}
            </div>
          }
        />
        <FieldRow
          label={t ? 'סגנון לבוש' : 'Clothing'}
          value={getLabel(FEMALE_CLOTHING_OPTIONS, profile.clothing, locale)}
        />
        <FieldRow
          label={t ? 'כיסוי ראש' : 'Head Covering'}
          value={getLabel(HEADCOVERING_OPTIONS, profile.headcovering, locale)}
        />
        <FieldRow
          label={t ? 'לבוש בן זוג רצוי' : 'Partner Clothing'}
          value={getLabel(FEMALE_PARTNER_CLOTHING_OPTIONS, profile.partnerClothing, locale)}
        />
        <FieldRow
          label={t ? 'סוג טלפון' : 'Phone Type'}
          value={getLabel(PHONE_TYPE_OPTIONS, profile.phoneType, locale)}
        />
      </div>

      {/* AI Summary */}
      <AISummary profile={profile} gender="female" locale={locale} />

      {/* Lock + Export */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">
          {t ? 'ניהול רשומה' : 'Record Management'}
        </h2>
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <LockIndicator
            lockedAt={lockedAt}
            locale={locale}
            onLock={lockedAt ? undefined : handleLock}
          />
          <PdfExportButton profileId={profile.id} locale={locale} />
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">
          {t ? 'הערות פנימיות' : 'Internal Notes'}
        </h2>
        <NotesThread notes={notes} locale={locale} onAddNote={handleAddNote} />
      </div>

    </div>
  )
}
