'use client'

import { useState } from 'react'
import type { FemaleProfile, MatchmakerStatus, Note } from '@/types/registration'
import { getT } from '@/lib/i18n/translations'
import { TrafficLight } from './TrafficLight'
import { LockIndicator } from './LockIndicator'
import { NotesThread } from './NotesThread'
import { PdfExportButton } from './PdfExportButton'
import { AISummary } from './AISummary'
import { useLockIdentity, canActOnLock } from '@/lib/matchmaker/lockContext'
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
  locale: string,
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
  const { name: currentName, isAdmin } = useLockIdentity()

  const [status,   setStatusState] = useState<MatchmakerStatus>(profile.matchmakerStatus)
  const [lockedAt, setLockedAt]    = useState<Date | null>(profile.lockedAt)
  const [lockedBy, setLockedBy]    = useState<string | undefined>(profile.lockedBy)
  const [notes,    setNotes]       = useState<Note[]>(profile.notes)

  const T = getT(locale)

  // Ownership checks
  const canUnlock      = canActOnLock(lockedBy, currentName, isAdmin)
  const isGreenStatus  = status === 'green'
  const canChangeStatus = !isGreenStatus || canActOnLock(lockedBy, currentName, isAdmin)

  const handleAddNote = (text: string) => {
    setNotes((prev) => [
      ...prev,
      {
        id:        Date.now().toString(),
        author:    currentName,
        text,
        createdAt: new Date(),
      },
    ])
  }

  const handleLock = () => {
    setLockedAt(new Date())
    setLockedBy(currentName)
    setStatusState('green')
  }

  const handleUnlock = () => {
    if (!canActOnLock(lockedBy, currentName, isAdmin)) return
    setLockedAt(null)
    setLockedBy(undefined)
    if (status === 'green') setStatusState('orange')
  }

  const handleStatusChange = (newStatus: MatchmakerStatus) => {
    if (!canChangeStatus) return
    setStatusState(newStatus)
    // When manually setting green, claim ownership
    if (newStatus === 'green') {
      setLockedBy(currentName)
    } else {
      // Releasing green — clear the lock ownership
      setLockedBy(undefined)
    }
  }

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
                  {T.profile.lastNameHidden}
                </span>
              </h1>
              <p className="text-navy-200 text-sm mt-1">
                {T.profile.age}: {profile.age}
                {' · '}
                {profile.city}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <TrafficLight
                status={status}
                locale={locale}
                onChange={handleStatusChange}
                canChange={canChangeStatus}
                lockedBy={lockedBy}
              />
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="px-6 py-4">
          <FieldRow label={T.profile.hebrewBirthday} value={profile.hebrewBirthday} />
          <FieldRow
            label={T.profile.maritalStatus}
            value={getLabel(MARITAL_STATUS_OPTIONS, profile.status as never, locale)}
          />
          <FieldRow label={T.profile.community} value={profile.community} />
          <FieldRow label={T.profile.occupation} value={profile.occupation} />
          <FieldRow label={T.profile.email} value={profile.email} />
          <FieldRow
            label={T.profile.phone}
            value={<span className="text-gray-400 italic">{T.profile.phoneHidden}</span>}
          />
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">{T.profile.profileDetails}</h2>
        <FieldRow
          label={T.profile.style}
          value={getLabel(FEMALE_STYLE_OPTIONS, profile.style, locale)}
        />
        <FieldRow
          label={T.profile.traits}
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
          label={T.profile.clothing}
          value={getLabel(FEMALE_CLOTHING_OPTIONS, profile.clothing, locale)}
        />
        <FieldRow
          label={T.profile.headcovering}
          value={getLabel(HEADCOVERING_OPTIONS, profile.headcovering, locale)}
        />
        <FieldRow
          label={T.profile.partnerClothingFemale}
          value={getLabel(FEMALE_PARTNER_CLOTHING_OPTIONS, profile.partnerClothing, locale)}
        />
        <FieldRow
          label={T.profile.phoneType}
          value={getLabel(PHONE_TYPE_OPTIONS, profile.phoneType, locale)}
        />
      </div>

      {/* AI Summary */}
      <AISummary profile={profile} gender="female" locale={locale} />

      {/* Lock + Export */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">{T.profile.recordManagement}</h2>
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <LockIndicator
            lockedAt={lockedAt}
            lockedBy={lockedBy}
            locale={locale}
            canUnlock={canUnlock}
            onLock={!lockedAt ? handleLock : undefined}
            onUnlock={lockedAt ? handleUnlock : undefined}
          />
          <PdfExportButton profileId={profile.id} locale={locale} />
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">{T.profile.internalNotes}</h2>
        <NotesThread notes={notes} locale={locale} onAddNote={handleAddNote} />
      </div>

    </div>
  )
}
