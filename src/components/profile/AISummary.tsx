'use client'

import { useEffect, useState } from 'react'
import type { MaleProfile, FemaleProfile } from '@/types/registration'
import { getT } from '@/lib/i18n/translations'

interface AISummaryProps {
  profile: MaleProfile | FemaleProfile
  gender: 'male' | 'female'
  locale?: string
}

export function AISummary({ profile, gender, locale = 'he' }: AISummaryProps) {
  const [bullets, setBullets] = useState<string[]>([])
  const [source, setSource] = useState<'ai' | 'structured' | null>(null)
  const [loading, setLoading] = useState(true)
  const T = getT(locale)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aboutMe:            profile.aboutMe,
        aboutPartner:       profile.aboutPartner,
        name:               profile.firstName,
        gender,
        locale,
        style:              profile.style,
        traits:             profile.traits,
        relationshipValues: profile.relationshipValues,
        brings:             profile.brings,
        doesntSuit:         profile.doesntSuit,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setBullets(data.bullets ?? [])
          setSource(data.source)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [profile.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy-500 text-base flex items-center gap-2">
          <span className="text-lg">✦</span>
          {T.ai.title}
        </h2>
        {source === 'ai' && !loading && (
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium">
            {T.ai.powered}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-200 shrink-0" />
              <div
                className="h-4 rounded bg-gray-100 animate-pulse"
                style={{ width: `${65 + i * 10}%` }}
              />
            </div>
          ))}
        </div>
      ) : bullets.length === 0 ? (
        <p className="text-sm text-gray-400 italic">{T.ai.empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-navy-400 shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      {(profile.aboutMe || profile.aboutPartner) && !loading && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {profile.aboutMe && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">{T.ai.aboutMe}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.aboutMe}</p>
            </div>
          )}
          {profile.aboutPartner && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">{T.ai.lookingFor}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.aboutPartner}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
