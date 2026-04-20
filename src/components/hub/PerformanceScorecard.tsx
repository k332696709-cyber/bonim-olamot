'use client'

import type { MatchmakerLeaderboardEntry } from '@/types/hub'

type ActivityLevel = 'high' | 'medium' | 'low'

function getActivityLevel(postsCount: number): ActivityLevel {
  if (postsCount >= 10) return 'high'
  if (postsCount >= 5) return 'medium'
  return 'low'
}

function ActivityBars({ level, locale }: { level: ActivityLevel; locale: string }) {
  const isHe = locale === 'he'
  const config: Record<ActivityLevel, { label: string; color: string; bars: number; textColor: string }> = {
    high:   { label: isHe ? 'גבוהה'   : 'High',   color: 'bg-green-500',  bars: 3, textColor: 'text-green-600' },
    medium: { label: isHe ? 'בינונית' : 'Medium', color: 'bg-orange-400', bars: 2, textColor: 'text-orange-500' },
    low:    { label: isHe ? 'נמוכה'   : 'Low',    color: 'bg-red-400',    bars: 1, textColor: 'text-red-500' },
  }
  const c = config[level]

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-2 rounded-sm transition-all ${i <= c.bars ? c.color : 'bg-gray-200'}`}
            style={{ height: `${5 + i * 4}px` }}
          />
        ))}
      </div>
      <span className={`text-xs font-bold ${c.textColor}`}>{c.label}</span>
    </div>
  )
}

function Row({ label, value, sub, valueClass = 'text-navy-700' }: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="text-end">
        <span className={`text-sm font-bold tabular-nums ${valueClass}`}>{value}</span>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface PerformanceScorecardProps {
  entry: MatchmakerLeaderboardEntry | null
  locale: string
}

export function PerformanceScorecard({ entry, locale }: PerformanceScorecardProps) {
  const isHe = locale === 'he'

  if (!entry) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center h-52">
        <p className="text-sm text-gray-400">{isHe ? 'אין נתונים זמינים' : 'No data available'}</p>
      </div>
    )
  }

  const totalActions = entry.postsCount + entry.statusUpdatesCount
  const successRate = totalActions > 0
    ? Math.round((entry.successfulMatchesCount / Math.max(totalActions, 1)) * 100)
    : 0

  const rateClass =
    successRate >= 50 ? 'text-green-600' :
    successRate >= 20 ? 'text-orange-500' :
    'text-red-500'

  const activityLevel = getActivityLevel(entry.postsCount)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-navy-600 flex items-center justify-center text-white font-bold text-base shrink-0">
          {entry.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-navy-700">{entry.name}</p>
          <p className="text-[11px] text-gray-400">{isHe ? 'כרטיס ביצועים אישי' : 'Personal Performance Card'}</p>
        </div>
      </div>

      {/* Stats */}
      <Row
        label={isHe ? 'אחוז הצלחה' : 'Success Rate'}
        value={`${successRate}%`}
        sub={isHe
          ? `${entry.successfulMatchesCount} שידוכים הצליחו`
          : `${entry.successfulMatchesCount} successful matches`}
        valueClass={rateClass}
      />
      <Row
        label={isHe ? 'הצעות פעילות' : 'Active Proposals'}
        value={entry.activeProposalsCount}
      />
      <Row
        label={isHe ? 'פוסטים החודש' : 'Posts This Month'}
        value={entry.postsCount}
      />
      <Row
        label={isHe ? 'עדכוני סטטוס' : 'Status Updates'}
        value={entry.statusUpdatesCount}
      />

      {/* Activity level */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">{isHe ? 'רמת פעילות' : 'Activity Level'}</span>
        <ActivityBars level={activityLevel} locale={locale} />
      </div>
    </div>
  )
}
