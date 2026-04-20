'use client'

import type { MatchProgress, MatchStage } from '@/types/hub'
import { MATCH_STAGES } from '@/types/hub'

const STAGE_LABELS_HE: Record<MatchStage, string> = {
  checking: 'בירורים',
  proposal_sent: 'הצעה נשלחה',
  meeting_1: 'פגישה 1',
  meeting_2: 'פגישה 2',
  closing: 'סגירה',
}

const STAGE_LABELS_EN: Record<MatchStage, string> = {
  checking: 'Checking',
  proposal_sent: 'Proposal Sent',
  meeting_1: 'Meeting 1',
  meeting_2: 'Meeting 2',
  closing: 'Closing',
}

const STAGE_TRACK_COLOR: Record<MatchStage, string> = {
  checking: 'bg-gray-400',
  proposal_sent: 'bg-blue-400',
  meeting_1: 'bg-orange-400',
  meeting_2: 'bg-navy-500',
  closing: 'bg-green-500',
}

const STAGE_BADGE: Record<MatchStage, string> = {
  checking:      'bg-gray-50  border-gray-200  text-gray-600',
  proposal_sent: 'bg-blue-50  border-blue-200  text-blue-700',
  meeting_1:     'bg-orange-50 border-orange-200 text-orange-700',
  meeting_2:     'bg-navy-50  border-navy-200  text-navy-700',
  closing:       'bg-green-50 border-green-200 text-green-700',
}

function ProgressBar({ stage, locale }: { stage: MatchStage; locale: string }) {
  const isHe = locale === 'he'
  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const currentIdx = MATCH_STAGES.indexOf(stage)
  const trackColor = STAGE_TRACK_COLOR[stage]

  return (
    <div className="flex w-full gap-0.5 mt-1" dir={isHe ? 'rtl' : 'ltr'}>
      {MATCH_STAGES.map((s, i) => {
        const filled = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={s} className="flex flex-col items-center flex-1 gap-1">
            <div
              className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                filled ? trackColor : 'bg-gray-200'
              }`}
            />
            <span
              className={`text-[9px] font-medium leading-tight text-center whitespace-nowrap ${
                isCurrent ? 'text-navy-600 font-bold' : filled ? 'text-gray-500' : 'text-gray-300'
              }`}
            >
              {labels[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function MatchCard({
  match,
  locale,
  canEdit,
  onAdvance,
}: {
  match: MatchProgress
  locale: string
  canEdit: boolean
  onAdvance: (id: string, next: MatchStage) => void
}) {
  const isHe = locale === 'he'
  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const currentIdx = MATCH_STAGES.indexOf(match.stage)
  const hasNext = currentIdx < MATCH_STAGES.length - 1
  const nextStage = hasNext ? MATCH_STAGES[currentIdx + 1] : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3" dir={isHe ? 'rtl' : 'ltr'}>
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-700 flex-wrap">
            <span className="text-pink-500 text-xs">♀</span>
            <span>{match.femaleName}</span>
            <span className="text-gray-300">×</span>
            <span className="text-blue-500 text-xs">♂</span>
            <span>{match.maleName}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {isHe ? 'שדכנ/ית:' : 'Matchmaker:'} {match.matchmakerName}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STAGE_BADGE[match.stage]}`}>
          {labels[match.stage]}
        </span>
      </div>

      <ProgressBar stage={match.stage} locale={locale} />

      {canEdit && nextStage && (
        <button
          type="button"
          onClick={() => onAdvance(match.id, nextStage)}
          className="mt-3 text-xs font-medium text-navy-600 hover:text-navy-800 border border-navy-200
            rounded-lg px-3 py-1 hover:bg-navy-50 transition-colors"
          dir={isHe ? 'rtl' : 'ltr'}
        >
          {isHe ? `← קדם ל: ${labels[nextStage]}` : `→ Advance to: ${labels[nextStage]}`}
        </button>
      )}
    </div>
  )
}

interface MatchProgressSectionProps {
  matches: MatchProgress[]
  isAdmin: boolean
  currentUserEmail: string
  locale: string
  onStageUpdate: (matchId: string, newStage: MatchStage) => void
}

export function MatchProgressSection({
  matches,
  isAdmin,
  currentUserEmail,
  locale,
  onStageUpdate,
}: MatchProgressSectionProps) {
  const isHe = locale === 'he'
  const visible = isAdmin ? matches : matches.filter(m => m.matchmakerEmail === currentUserEmail)

  const labels = isHe ? STAGE_LABELS_HE : STAGE_LABELS_EN
  const stageCounts = MATCH_STAGES.reduce(
    (acc, s) => { acc[s] = visible.filter(m => m.stage === s).length; return acc },
    {} as Record<MatchStage, number>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-navy-600 flex items-center gap-2">
          <span>📊</span>
          <span>{isHe ? 'מעקב התקדמות שידוכים' : 'Match Progress Tracker'}</span>
        </h2>
        <span className="text-xs text-gray-400">
          {isHe ? `${visible.length} שידוכים פעילים` : `${visible.length} active matches`}
        </span>
      </div>

      {/* Stage summary pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MATCH_STAGES.map(s => (
          <div
            key={s}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-opacity ${
              stageCounts[s] > 0 ? 'opacity-100' : 'opacity-40'
            } bg-gray-50 border-gray-200`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${STAGE_TRACK_COLOR[s]}`} />
            <span className="text-gray-600 font-medium">{labels[s]}</span>
            <span className="font-bold text-navy-700">{stageCounts[s]}</span>
          </div>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          {isHe ? 'אין שידוכים פעילים' : 'No active matches'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              locale={locale}
              canEdit={isAdmin || match.matchmakerEmail === currentUserEmail}
              onAdvance={onStageUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
