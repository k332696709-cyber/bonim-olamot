'use client'

import type { MatchmakerLeaderboardEntry } from '@/types/hub'

const MEDALS = ['🥇', '🥈', '🥉']

interface AdminLeaderboardProps {
  entries: MatchmakerLeaderboardEntry[]
  locale: string
}

function score(e: MatchmakerLeaderboardEntry): number {
  return e.postsCount + e.statusUpdatesCount + e.successfulMatchesCount * 3
}

export function AdminLeaderboard({ entries, locale }: AdminLeaderboardProps) {
  const isHe = locale === 'he'
  const sorted = [...entries].sort((a, b) => score(b) - score(a))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-base">🏆</span>
        <h2 className="text-sm font-bold text-navy-600">
          {isHe ? 'לוח מובילים – שדכנים' : 'Matchmaker Leaderboard'}
        </h2>
        <span className="ms-auto text-[10px] bg-purple-50 text-purple-600 border border-purple-100
          px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
          {isHe ? 'מנהל בלבד' : 'Admin Only'}
        </span>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="text-start pb-2 pe-3 font-medium w-8">#</th>
              <th className="text-start pb-2 pe-3 font-medium">{isHe ? 'שדכן/ית' : 'Matchmaker'}</th>
              <th className="text-center pb-2 pe-3 font-medium">{isHe ? 'פוסטים' : 'Posts'}</th>
              <th className="text-center pb-2 pe-3 font-medium">{isHe ? 'עדכוני סטטוס' : 'Updates'}</th>
              <th className="text-center pb-2 pe-3 font-medium">{isHe ? 'שידוכים' : 'Matches'}</th>
              <th className="text-center pb-2 font-medium">{isHe ? 'פעילות' : 'Active'}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => (
              <tr key={entry.email} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="py-3 pe-3">
                  {i < 3
                    ? <span className="text-base leading-none">{MEDALS[i]}</span>
                    : <span className="font-bold text-gray-400">{i + 1}.</span>
                  }
                </td>
                <td className="py-3 pe-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-100 border border-navy-200 flex items-center
                      justify-center text-xs font-bold text-navy-600 shrink-0">
                      {entry.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-700">{entry.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {isHe ? `ניקוד: ${score(entry)}` : `Score: ${score(entry)}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pe-3 text-center font-semibold text-gray-700">{entry.postsCount}</td>
                <td className="py-3 pe-3 text-center font-semibold text-gray-700">{entry.statusUpdatesCount}</td>
                <td className="py-3 pe-3 text-center">
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                    entry.successfulMatchesCount >= 3
                      ? 'bg-green-50  text-green-700  border-green-200'
                      : entry.successfulMatchesCount >= 1
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-gray-50   text-gray-500   border-gray-200'
                  }`}>
                    {entry.successfulMatchesCount}
                  </span>
                </td>
                <td className="py-3 text-center font-semibold text-navy-600">{entry.activeProposalsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
