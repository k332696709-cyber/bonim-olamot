'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { FemaleProfile, MaleProfile, Note } from '@/types/registration'
import { getT } from '@/lib/i18n/translations'
import { TrafficLight } from '@/components/profile/TrafficLight'
import { NotesThread } from '@/components/profile/NotesThread'
import { computeStatus, formatLastOffer, lockRemainingMs } from '@/lib/matchmaker/statusUtils'
import { useLockIdentity, canActOnLock } from '@/lib/matchmaker/lockContext'
import { Button } from '@/components/ui/Button'
import { FEMALE_STYLE_OPTIONS, MALE_STYLE_OPTIONS } from '@/constants/formOptions'

type AnyProfile = FemaleProfile | MaleProfile

interface RowState {
  lockedAt:   Date | null
  lockedBy:   string | null
  notes:      Note[]
  notesOpen:  boolean
  exporting:  boolean
}

export interface ProfilesTableProps {
  profiles: AnyProfile[]
  gender:   'female' | 'male'
  locale?:  string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStyleLabel(profile: AnyProfile, gender: 'female' | 'male', locale: string): string {
  const opts = gender === 'female' ? FEMALE_STYLE_OPTIONS : MALE_STYLE_OPTIONS
  const opt  = opts.find((o) => o.value === (profile as FemaleProfile).style)
  return opt ? (locale === 'he' ? opt.he : opt.en) : (profile as FemaleProfile).style
}

// ─── Lock countdown badge ─────────────────────────────────────────────────────

function LockBadge({ lockedAt, locale }: { lockedAt: Date; locale: string }) {
  const [ms, setMs] = useState(() => lockRemainingMs(lockedAt))

  useEffect(() => {
    const id = setInterval(() => setMs(lockRemainingMs(lockedAt)), 60_000)
    return () => clearInterval(id)
  }, [lockedAt])

  if (ms === 0) return null
  const h = Math.floor(ms / (1000 * 60 * 60))
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      {locale === 'he' ? `${h}ש׳ ${m}ד׳` : `${h}h ${m}m`}
    </span>
  )
}

// ─── "Locked by other" badge with tooltip ─────────────────────────────────────

function LockedByOtherBadge({
  lockedBy, lockedAt, locale,
}: { lockedBy: string; lockedAt: Date | null; locale: string }) {
  const T = getT(locale)
  const remaining = lockedAt ? lockRemainingMs(lockedAt) : 0
  const h = Math.floor(remaining / (1000 * 60 * 60))
  const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  const tooltip = locale === 'he'
    ? `פרופיל זה נעול על ידי ${lockedBy}${remaining > 0 ? ` (${h}ש׳ ${m}ד׳ נותרו)` : ''}. רק הם או מנהל יכולים לשחרר אותו.`
    : `Profile locked by ${lockedBy}${remaining > 0 ? ` (${h}h ${m}m remaining)` : ''}. Only they or an admin can release it.`

  return (
    <div className="relative group/locked inline-flex">
      <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 cursor-default select-none">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="font-semibold">{lockedBy}</span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 start-0 hidden group-hover/locked:flex
                      z-20 w-60 bg-gray-900 text-white text-xs rounded-xl
                      px-3.5 py-2.5 shadow-xl pointer-events-none flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-semibold text-red-300">{T.dashboard.profileLocked}</span>
        </div>
        <p className="text-gray-300 leading-relaxed">{tooltip}</p>
        <div className="absolute top-full start-4 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const IconPlay = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconPdf = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

const IconNotes = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
)

const IconEye = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfilesTable({ profiles, gender, locale = 'he' }: ProfilesTableProps) {
  const T = getT(locale)
  const { name: currentName, isAdmin } = useLockIdentity()

  const [rowStates, setRowStates] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      profiles.map((p) => [
        p.id,
        {
          lockedAt:  p.lockedAt,
          lockedBy:  p.lockedBy ?? null,
          notes:     [...p.notes],
          notesOpen: false,
          exporting: false,
        },
      ]),
    ),
  )

  const updateRow = useCallback((id: string, patch: Partial<RowState>) => {
    setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const handleStartWork = useCallback((id: string) => {
    updateRow(id, { lockedAt: new Date(), lockedBy: currentName })
  }, [updateRow, currentName])

  const handleUnlock = useCallback((id: string) => {
    const rs = rowStates[id]
    if (!rs) return
    if (!canActOnLock(rs.lockedBy, currentName, isAdmin)) return
    updateRow(id, { lockedAt: null, lockedBy: null })
  }, [updateRow, rowStates, currentName, isAdmin])

  const handleAddNote = useCallback((id: string, text: string) => {
    const note: Note = {
      id:        `${id}-${Date.now()}`,
      author:    currentName,
      text,
      createdAt: new Date(),
    }
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes: [...prev[id].notes, note] },
    }))
  }, [currentName])

  const handleExport = useCallback(async (id: string) => {
    updateRow(id, { exporting: true })
    try {
      const res = await fetch(`/api/export/profile/${id}?gender=${gender}`, { method: 'POST' })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `profile-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      updateRow(id, { exporting: false })
    }
  }, [gender, updateRow])

  const d = T.dashboard
  const cols = [d.cols.name, d.cols.age, d.cols.city, d.cols.style, d.cols.status, d.cols.lastOffer, d.cols.lock, d.cols.actions]

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-gray-400 text-sm shadow-card">
        {d.empty}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-card bg-white">
      <table className="w-full border-collapse text-sm" dir={locale === 'he' ? 'rtl' : 'ltr'}>
        <thead>
          <tr className="bg-gradient-to-l from-navy-600 to-navy-700">
            {cols.map((col) => (
              <th
                key={col}
                className="px-4 py-3.5 text-start text-xs font-bold text-navy-100 uppercase tracking-wide whitespace-nowrap first:rounded-ts-2xl last:rounded-te-2xl"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {profiles.map((profile, idx) => {
            const rs = rowStates[profile.id]
            if (!rs) return null

            const profileWithState: AnyProfile = { ...profile, lockedAt: rs.lockedAt }
            const status        = computeStatus(profileWithState)
            const lockActive    = rs.lockedAt !== null && lockRemainingMs(rs.lockedAt) > 0
            const isEven        = idx % 2 === 0

            // Is this profile locked by someone other than the current user?
            const lockedByOther = lockActive
              && !!rs.lockedBy
              && !canActOnLock(rs.lockedBy, currentName, isAdmin)

            // Can the current user change the status (green is protected)?
            const canChangeStatus = status !== 'green'
              || canActOnLock(rs.lockedBy, currentName, isAdmin)

            return (
              <React.Fragment key={profile.id}>
                {/* ── Main row ── */}
                <tr
                  className={cn(
                    'border-b border-gray-100 transition-colors duration-100',
                    lockedByOther
                      ? 'bg-red-50/30 hover:bg-red-50/50'
                      : isEven
                        ? 'bg-white hover:bg-navy-50/30'
                        : 'bg-gray-50/50 hover:bg-navy-50/30',
                  )}
                >
                  {/* Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      href={`/${locale}/matchmaker/profiles/${profile.id}`}
                      className="font-semibold text-navy-700 hover:text-navy-500 hover:underline underline-offset-2 transition-colors"
                    >
                      {profile.firstName}
                      <span className="text-gray-400 font-normal ms-1 text-xs">
                        {profile.lastName.charAt(0)}.
                      </span>
                    </Link>
                  </td>

                  {/* Age */}
                  <td className="px-4 py-3.5 text-gray-600 text-center tabular-nums">
                    {profile.age}
                  </td>

                  {/* City */}
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {profile.city}
                  </td>

                  {/* Style */}
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {getStyleLabel(profile, gender, locale)}
                  </td>

                  {/* Status — non-green always changeable; green only for owner/admin */}
                  <td className="px-4 py-3.5">
                    <TrafficLight
                      status={status}
                      locale={locale}
                      compact
                    />
                  </td>

                  {/* Last Offer */}
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                    {formatLastOffer(profile.lastOfferDate, locale)}
                  </td>

                  {/* Lock column */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {lockedByOther ? (
                      /* Locked by someone else — show blocked badge */
                      <LockedByOtherBadge
                        lockedBy={rs.lockedBy!}
                        lockedAt={rs.lockedAt}
                        locale={locale}
                      />
                    ) : lockActive ? (
                      /* Locked by current user or admin can see/unlock */
                      <div className="flex items-center gap-2">
                        <LockBadge lockedAt={rs.lockedAt!} locale={locale} />
                        {canActOnLock(rs.lockedBy, currentName, isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleUnlock(profile.id)}
                            title={d.unlockBtn}
                            className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors text-xs font-bold leading-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Not locked — offer Start Work */
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartWork(profile.id)}
                        className="text-xs gap-1.5 whitespace-nowrap"
                      >
                        <IconPlay />
                        {d.startWork}
                      </Button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* View — always available */}
                      <Link
                        href={`/${locale}/matchmaker/profiles/${profile.id}`}
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          'px-2.5 py-1.5 rounded-lg border border-navy-200',
                          'text-navy-600 hover:bg-navy-50 transition-colors whitespace-nowrap',
                        )}
                      >
                        <IconEye />
                        {d.view}
                      </Link>

                      {/* PDF — always available */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        loading={rs.exporting}
                        onClick={() => handleExport(profile.id)}
                        className={cn(
                          'text-xs gap-1 whitespace-nowrap',
                          'border-burgundy-200 text-burgundy-600 hover:bg-burgundy-50',
                        )}
                      >
                        {!rs.exporting && <IconPdf />}
                        PDF
                      </Button>

                      {/* Notes — always available (anyone can add notes) */}
                      <button
                        type="button"
                        onClick={() => updateRow(profile.id, { notesOpen: !rs.notesOpen })}
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          'px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap',
                          rs.notesOpen
                            ? 'bg-navy-600 text-white border-navy-600'
                            : 'text-navy-500 border-navy-200 hover:bg-navy-50',
                        )}
                      >
                        <IconNotes />
                        {d.notes}
                        {rs.notes.length > 0 && (
                          <span className={cn(
                            'w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold',
                            rs.notesOpen ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600',
                          )}>
                            {rs.notes.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ── Expandable notes row ── */}
                {rs.notesOpen && (
                  <tr className="bg-navy-50/40 border-b border-navy-100">
                    <td colSpan={8} className="px-6 py-5">
                      <div className="max-w-2xl">
                        {lockedByOther && (
                          <div className="flex items-center gap-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {locale === 'he'
                              ? `פרופיל זה נעול על ידי ${rs.lockedBy}. ניתן לצפות ולהוסיף הערות בלבד.`
                              : `Profile locked by ${rs.lockedBy}. You can only view and add notes.`}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-5 bg-navy-400 rounded-full" />
                          <h4 className="text-sm font-bold text-navy-700">
                            {d.internalNotes}
                            <span className="text-navy-400 font-normal ms-2">
                              – {profile.firstName} {profile.lastName.charAt(0)}.
                            </span>
                          </h4>
                        </div>
                        <NotesThread
                          notes={rs.notes}
                          locale={locale}
                          onAddNote={(text) => handleAddNote(profile.id, text)}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
