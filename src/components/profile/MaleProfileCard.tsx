'use client'

import { useState } from 'react'
import type { FemaleProfile, MaleProfile, MatchmakerStatus, Note } from '@/types/registration'
import { getT } from '@/lib/i18n/translations'
import { TrafficLight } from './TrafficLight'
import { LockIndicator } from './LockIndicator'
import { NotesThread } from './NotesThread'
import { PdfExportButton } from './PdfExportButton'
import { FullResumeButton } from './FullResumeButton'
import { AISummary } from './AISummary'
import { CompatibilityPanel } from './CompatibilityPanel'
import { useLockIdentity, canActOnLock } from '@/lib/matchmaker/lockContext'
import {
  MALE_STYLE_OPTIONS,
  TRAIT_OPTIONS_MALE,
  MALE_CLOTHING_OPTIONS,
  MALE_PARTNER_CLOTHING_OPTIONS,
  PHONE_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from '@/constants/formOptions'

interface MaleProfileCardProps {
  profile:          MaleProfile
  locale?:          string
  femaleCandidates: FemaleProfile[]
}

function getLabel(
  options: { value: string; he: string; en: string }[],
  value: string,
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

export function MaleProfileCard({ profile, locale = 'he', femaleCandidates }: MaleProfileCardProps) {
  const { name: currentName, isAdmin } = useLockIdentity()
  const T = getT(locale)

  const [status,   setStatusState] = useState<MatchmakerStatus>(profile.matchmakerStatus)
  const [lockedAt, setLockedAt]    = useState<Date | null>(profile.lockedAt)
  const [lockedBy, setLockedBy]    = useState<string | undefined>(profile.lockedBy)
  const [notes,    setNotes]       = useState<Note[]>(profile.notes)

  const canUnlock       = canActOnLock(lockedBy, currentName, isAdmin)
  const isGreenStatus   = status === 'green'
  const canChangeStatus = !isGreenStatus || canActOnLock(lockedBy, currentName, isAdmin)

  const handleAddNote = (text: string) => {
    setNotes((prev) => [
      ...prev,
      { id: Date.now().toString(), author: currentName, text, createdAt: new Date() },
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
    if (newStatus === 'green') {
      setLockedBy(currentName)
    } else {
      setLockedBy(undefined)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Header */}
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
                {T.profile.age}: {profile.age} · {profile.city}
              </p>
            </div>
            <TrafficLight
              status={status}
              locale={locale}
              onChange={handleStatusChange}
              canChange={canChangeStatus}
              lockedBy={lockedBy}
            />
          </div>
        </div>

        <div className="px-6 py-4">
          <FieldRow label={T.profile.hebrewBirthday} value={profile.hebrewBirthday} />
          <FieldRow
            label={T.profile.maritalStatus}
            value={getLabel(MARITAL_STATUS_OPTIONS, profile.status, locale)}
          />
          {(profile.status === 'divorced' || profile.status === 'widowed') && profile.hasChildren !== undefined && (
            <FieldRow
              label={T.profile.hasChildren}
              value={
                profile.hasChildren
                  ? `${T.profile.withChildren}${profile.numberOfChildren ? ` (${profile.numberOfChildren})` : ''}`
                  : T.profile.withoutChildren
              }
            />
          )}
          <FieldRow label={T.profile.community} value={profile.community} />
          <FieldRow label={T.profile.occupation} value={profile.occupation} />
          <FieldRow label={T.profile.email}      value={profile.email} />
          <FieldRow
            label={T.profile.phone}
            value={<span className="text-gray-400 italic">{T.profile.phoneHidden}</span>}
          />
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">{T.profile.profileDetails}</h2>
        <FieldRow
          label={T.profile.style}
          value={getLabel(MALE_STYLE_OPTIONS, profile.style, locale)}
        />
        <FieldRow
          label={T.profile.traits}
          value={
            <div className="flex flex-wrap gap-1.5">
              {profile.traits.map((trait) => (
                <span key={trait}
                  className="bg-navy-50 text-navy-600 text-xs px-2.5 py-1 rounded-full border border-navy-100 font-medium">
                  {getLabel(TRAIT_OPTIONS_MALE, trait, locale)}
                </span>
              ))}
            </div>
          }
        />
        <FieldRow
          label={T.profile.clothing}
          value={getLabel(MALE_CLOTHING_OPTIONS, profile.clothing, locale)}
        />
        <FieldRow
          label={T.profile.partnerClothingMale}
          value={getLabel(MALE_PARTNER_CLOTHING_OPTIONS, profile.partnerClothing, locale)}
        />
        <FieldRow
          label={T.profile.phoneType}
          value={getLabel(PHONE_TYPE_OPTIONS, profile.phoneType, locale)}
        />
      </div>

      {/* AI Summary */}
      <AISummary profile={profile} gender="male" locale={locale} />

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
          <PdfExportButton profileId={profile.id} locale={locale} gender="male" />
          <FullResumeButton profileId={profile.id} locale={locale} gender="male" />
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
        <h2 className="font-semibold text-navy-500 mb-4 text-base">{T.profile.internalNotes}</h2>
        <NotesThread notes={notes} locale={locale} onAddNote={handleAddNote} />
      </div>

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
