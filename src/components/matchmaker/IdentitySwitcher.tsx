'use client'

import { DEMO_IDENTITIES, useLockIdentity } from '@/lib/matchmaker/lockContext'
import { getT } from '@/lib/i18n/translations'

interface IdentitySwitcherProps {
  locale?: string
}

export function IdentitySwitcher({ locale = 'he' }: IdentitySwitcherProps) {
  const { name, isAdmin, setIdentity } = useLockIdentity()
  const T = getT(locale)

  return (
    <div className="flex items-center gap-2.5 bg-navy-50 border border-navy-200 rounded-xl px-3.5 py-2">
      {/* Person icon */}
      <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>

      <span className="text-xs text-navy-400 shrink-0">{T.dashboard.signedInAs}</span>

      <select
        value={name}
        onChange={(e) => {
          const found = DEMO_IDENTITIES.find((d) => d.name === e.target.value)
          if (found) setIdentity(found)
        }}
        className="text-xs font-semibold text-navy-700 bg-transparent border-none outline-none cursor-pointer"
        dir={locale === 'he' ? 'rtl' : 'ltr'}
      >
        {DEMO_IDENTITIES.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}{d.isAdmin ? ` (${T.dashboard.admin})` : ''}
          </option>
        ))}
      </select>

      {isAdmin && (
        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
          {T.dashboard.admin}
        </span>
      )}
    </div>
  )
}
