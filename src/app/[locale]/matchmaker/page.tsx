'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import { ProfilesTable } from '@/components/matchmaker/ProfilesTable'
import { IdentitySwitcher } from '@/components/matchmaker/IdentitySwitcher'
import { computeStatus, lockRemainingMs } from '@/lib/matchmaker/statusUtils'

type Tab = 'bachurot' | 'bachurim'

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number
  label: string
  color: 'navy' | 'green' | 'red' | 'orange'
  icon: React.ReactNode
}

function StatCard({ value, label, color, icon }: StatCardProps) {
  const colorMap = {
    navy:   { bg: 'bg-navy-50',   border: 'border-navy-200',   text: 'text-navy-700',   val: 'text-navy-600' },
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  val: 'text-green-600' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    val: 'text-red-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', val: 'text-orange-600' },
  }
  const c = colorMap[color]

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} px-5 py-4 flex items-center gap-4 shadow-sm`}>
      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${c.val}`}>{value}</p>
        <p className={`text-xs font-medium ${c.text} mt-0.5`}>{label}</p>
      </div>
    </div>
  )
}

// ─── Legend item ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }}
      />
      {label}
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function MatchmakerPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = locale === 'he'

  const [tab, setTab] = useState<Tab>('bachurot')

  // Computed stats (runs once per render; profiles are static mock data)
  const stats = useMemo(() => {
    const all = [...MOCK_FEMALE_PROFILES, ...MOCK_MALE_PROFILES]
    const active    = all.filter((p) => p.lockedAt !== null && lockRemainingMs(p.lockedAt) > 0).length
    const urgent    = all.filter((p) => computeStatus(p) === 'bright_red').length
    return {
      totalF: MOCK_FEMALE_PROFILES.length,
      totalM: MOCK_MALE_PROFILES.length,
      active,
      urgent,
    }
  }, [])

  const tabLabel = (which: Tab) =>
    which === 'bachurot'
      ? (t ? 'בחורות' : 'Bachurot')
      : (t ? 'בחורים' : 'Bachurim')

  const tabCount = (which: Tab) =>
    which === 'bachurot' ? stats.totalF : stats.totalM

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={t ? 'rtl' : 'ltr'}
    >
      {/* ── Page header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/${locale}`}
                className="text-xs text-navy-400 hover:text-navy-600 transition-colors"
              >
                {t ? 'בונים עולמות' : 'Bonim Olamot'}
              </Link>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-xs text-gray-500">
                {t ? 'מערכת השדכנים' : 'Matchmaker System'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-navy-700 font-serif">
              {t ? 'מערכת השדכנים' : 'Matchmaker System'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {t ? 'ניהול מועמדים ומועמדות – בונים עולמות' : 'Candidate Management – Bonim Olamot'}
            </p>
          </div>

          {/* Identity switcher (demo) + Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            <IdentitySwitcher locale={locale} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <LegendItem color="#22c55e" label={t ? 'שידוך פעיל' : 'Active Match'} />
            <LegendItem color="#f97316" label={t ? 'הצעה השבוע' : 'Offer This Week'} />
            <LegendItem color="#f87171" label={t ? 'חודש ללא הצעות' : '1 Month No Offer'} />
            <LegendItem color="#dc2626" label={t ? 'יותר מחודשיים' : '2+ Months'} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            value={stats.totalF}
            label={t ? 'בחורות' : 'Bachurot'}
            color="navy"
            icon="👩"
          />
          <StatCard
            value={stats.totalM}
            label={t ? 'בחורים' : 'Bachurim'}
            color="navy"
            icon="👨"
          />
          <StatCard
            value={stats.active}
            label={t ? 'שידוכים פעילים' : 'Active Matches'}
            color="green"
            icon="🔒"
          />
          <StatCard
            value={stats.urgent}
            label={t ? 'דחוף לטיפול' : 'Urgent'}
            color="red"
            icon="🚨"
          />
        </div>

        {/* ── Tab bar + table ── */}
        <section className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {(['bachurot', 'bachurim'] as Tab[]).map((which) => (
              <button
                key={which}
                type="button"
                onClick={() => setTab(which)}
                className={`
                  px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                  ${tab === which
                    ? 'bg-navy-600 text-white border-navy-600 shadow-md'
                    : 'bg-white text-navy-500 border-navy-200 hover:bg-navy-50'
                  }
                `}
              >
                {tabLabel(which)}
                <span
                  className={`
                    ms-2 text-xs px-1.5 py-0.5 rounded-full font-bold
                    ${tab === which ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600'}
                  `}
                >
                  {tabCount(which)}
                </span>
              </button>
            ))}
          </div>

          {/* key={tab} forces a full remount on tab switch so useState re-initialises */}
          <ProfilesTable
            key={tab}
            profiles={tab === 'bachurot' ? MOCK_FEMALE_PROFILES : MOCK_MALE_PROFILES}
            gender={tab === 'bachurot' ? 'female' : 'male'}
            locale={locale}
          />
        </section>

        {/* ── Status guide ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-card px-6 py-5">
          <h2 className="text-sm font-bold text-navy-600 mb-4">
            {t ? 'מדריך מצבים' : 'Status Guide'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                color: '#22c55e',
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-700',
                title: t ? 'שידוך פעיל (ירוק)' : 'Active Match (Green)',
                desc: t ? 'הפרופיל נעול לעבודה פעילה (48 שעות)' : 'Profile locked for active work (48 hours)',
              },
              {
                color: '#f97316',
                bg: 'bg-orange-50',
                border: 'border-orange-200',
                text: 'text-orange-700',
                title: t ? 'הצעה השבוע (כתום)' : 'Offer This Week (Orange)',
                desc: t ? 'הצעת שידוך נשלחה בשבוע האחרון' : 'A match offer was sent in the last week',
              },
              {
                color: '#f87171',
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-400',
                title: t ? 'אדום בהיר – חודש ללא הצעות' : 'Light Red – 1 Month No Offer',
                desc: t ? 'לא נשלחה הצעה במשך חודש' : 'No offer sent for approximately one month',
              },
              {
                color: '#dc2626',
                bg: 'bg-red-100',
                border: 'border-red-300',
                text: 'text-red-700',
                title: t ? 'אדום עז – יותר מחודשיים' : 'Bright Red – 2+ Months',
                desc: t ? 'לא נשלחה הצעה ביותר מחודשיים, או מעולם' : 'No offer sent for over two months, or never',
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl border ${item.bg} ${item.border} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}88` }}
                  />
                  <span className={`text-xs font-bold ${item.text}`}>{item.title}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
