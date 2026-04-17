'use client'

import { useMemo, useState } from 'react'
import type { MaleProfile, FemaleProfile } from '@/types/registration'
import { calculateCompatibility, type CompatibilityResult, type ConflictAlert } from '@/lib/matchmaking/compatibilityEngine'
import { getT } from '@/lib/i18n/translations'

interface CompatibilityPanelProps {
  currentProfile: MaleProfile | FemaleProfile
  currentGender: 'male' | 'female'
  candidates: (MaleProfile | FemaleProfile)[]
  locale?: string
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle
          cx="36" cy="36" r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-base font-bold text-gray-800">{score}%</span>
    </div>
  )
}

function ConflictBadge({ conflict, locale }: { conflict: ConflictAlert; locale: string }) {
  const T = getT(locale)
  const isMajor = conflict.severity === 'major'
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 ${
      isMajor ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
    }`}>
      <span className={`text-base mt-0.5 shrink-0 ${isMajor ? 'text-red-500' : 'text-amber-500'}`}>
        {isMajor ? '⚠' : '◎'}
      </span>
      <div>
        <span className={`text-xs font-semibold uppercase tracking-wide ${
          isMajor ? 'text-red-600' : 'text-amber-600'
        }`}>
          {isMajor ? T.compatibility.critical : T.compatibility.warning}
        </span>
        <p className={`text-sm mt-0.5 ${isMajor ? 'text-red-700' : 'text-amber-700'}`}>
          {locale === 'he' ? conflict.he : conflict.en}
        </p>
      </div>
    </div>
  )
}

function BreakdownBar({
  label, score, maxScore, locale,
}: { label: string; score: number; maxScore: number; locale: string }) {
  const pct = Math.round((score / maxScore) * 100)
  const color = pct >= 75 ? 'bg-green-500' : pct >= 45 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 shrink-0 text-end">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-14 text-start">
        {score}/{maxScore}
      </span>
    </div>
  )
}

export function CompatibilityPanel({
  currentProfile,
  currentGender,
  candidates,
  locale = 'he',
}: CompatibilityPanelProps) {
  const [selectedId, setSelectedId] = useState<string>('')
  const T = getT(locale)

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedId) ?? null,
    [candidates, selectedId],
  )

  const result: CompatibilityResult | null = useMemo(() => {
    if (!selectedCandidate) return null
    return currentGender === 'male'
      ? calculateCompatibility(currentProfile as MaleProfile, selectedCandidate as FemaleProfile)
      : calculateCompatibility(selectedCandidate as MaleProfile, currentProfile as FemaleProfile)
  }, [currentProfile, selectedCandidate, currentGender])

  const majorConflicts = result?.conflicts.filter((c) => c.severity === 'major') ?? []
  const minorConflicts = result?.conflicts.filter((c) => c.severity === 'minor') ?? []

  const scoreLabel = result
    ? result.score >= 80 ? T.compatibility.highMatch
      : result.score >= 60 ? T.compatibility.goodMatch
      : result.score >= 40 ? T.compatibility.moderateMatch
      : T.compatibility.lowMatch
    : ''

  const breakdownLabels = {
    style:     T.compatibility.style,
    values:    T.compatibility.values,
    practical: T.compatibility.practical,
    traits:    T.compatibility.traits,
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
      <h2 className="font-semibold text-navy-500 text-base mb-4 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        {T.compatibility.title}
      </h2>

      <div className="mb-5">
        <label className="block text-sm text-gray-500 mb-1.5">
          {currentGender === 'male' ? T.compatibility.selectFemale : T.compatibility.selectMale}
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-300"
          dir={locale === 'he' ? 'rtl' : 'ltr'}
        >
          <option value="">{T.compatibility.selectOption}</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} · {c.age} · {c.city}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score + label */}
          <div className="flex items-center gap-5">
            <ScoreRing score={result.score} />
            <div>
              <p className="text-lg font-bold text-gray-800">{scoreLabel}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {locale === 'he' ? `ניקוד: ${result.score}/100` : `Score: ${result.score}/100`}
              </p>
              {majorConflicts.length === 0 && result.score >= 60 && (
                <p className="text-xs text-green-600 mt-1 font-medium">{T.compatibility.noConflicts}</p>
              )}
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              {T.compatibility.breakdown}
            </p>
            {(Object.keys(result.breakdown) as (keyof typeof result.breakdown)[]).map((key) => (
              <BreakdownBar
                key={key}
                label={breakdownLabels[key]}
                score={result.breakdown[key].score}
                maxScore={result.breakdown[key].maxScore}
                locale={locale}
              />
            ))}
          </div>

          {/* Highlights */}
          {(result.highlightsHe.length > 0 || result.highlights.length > 0) && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-green-700 mb-2">{T.compatibility.strengths}</p>
              <ul className="space-y-1">
                {(locale === 'he' ? result.highlightsHe : result.highlights).map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-green-700">
                    <span className="text-green-500 text-xs">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conflicts */}
          {result.conflicts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {T.compatibility.alerts}
              </p>
              {majorConflicts.map((c, i) => (
                <ConflictBadge key={`major-${i}`} conflict={c} locale={locale} />
              ))}
              {minorConflicts.map((c, i) => (
                <ConflictBadge key={`minor-${i}`} conflict={c} locale={locale} />
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedId && (
        <p className="text-sm text-gray-400 italic text-center py-4">
          {T.compatibility.selectPrompt}
        </p>
      )}
    </div>
  )
}
