'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import {
  MOCK_ANNOUNCEMENT,
  MOCK_SOCIAL_POSTS,
  MOCK_MATCH_PROGRESS,
  MOCK_LEADERBOARD,
} from '@/constants/mockHubData'
import { ProfilesTable } from '@/components/matchmaker/ProfilesTable'
import { computeStatus, lockRemainingMs } from '@/lib/matchmaker/statusUtils'
import { getSession, clearSession, type MatchmakerSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n/translations'
import { AnnouncementBar } from '@/components/hub/AnnouncementBar'
import { SocialWall } from '@/components/hub/SocialWall'
import { MatchProgressSection } from '@/components/hub/MatchProgressSection'
import { PerformanceScorecard } from '@/components/hub/PerformanceScorecard'
import { AdminLeaderboard } from '@/components/hub/AdminLeaderboard'
import type { SocialPost, Announcement, MatchProgress, MatchStage } from '@/types/hub'

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
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
      {label}
    </div>
  )
}

// ─── User Badge + Logout ──────────────────────────────────────────────────────

function UserBadge({ session, locale, onLogout }: { session: MatchmakerSession; locale: string; onLogout: () => void }) {
  const isHe = locale === 'he'
  return (
    <div className="flex items-center gap-2.5 bg-navy-50 border border-navy-200 rounded-xl px-3.5 py-2">
      <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="text-xs text-navy-400 shrink-0">{isHe ? 'מחובר כ:' : 'Signed in as:'}</span>
      <span className="text-xs font-semibold text-navy-700">{session.name}</span>
      {session.role === 'admin' && (
        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
          {isHe ? 'מנהל' : 'Admin'}
        </span>
      )}
      <button
        type="button"
        onClick={onLogout}
        className="ms-1 text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
      >
        {isHe ? 'יציאה' : 'Sign out'}
      </button>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-base">{emoji}</span>
      <div>
        <h2 className="text-sm font-bold text-navy-600">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function MatchmakerPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const T = getT(locale)
  const d = T.dashboard
  const isHe = locale === 'he'
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('bachurot')
  const [session, setSession] = useState<MatchmakerSession | null>(null)
  const [announcement, setAnnouncement] = useState<Announcement>(MOCK_ANNOUNCEMENT)
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS)
  const [matchProgress, setMatchProgress] = useState<MatchProgress[]>(MOCK_MATCH_PROGRESS)

  useEffect(() => {
    setSession(getSession())
  }, [])

  const isAdmin = session?.role === 'admin'
  const currentEmail = session?.email ?? ''

  const handleLogout = async () => {
    clearSession()
    await createClient().auth.signOut()
    router.push(`/${locale}/login`)
  }

  const handleAnnouncementUpdate = useCallback((text: string) => {
    setAnnouncement(prev => ({ ...prev, text, active: text.trim().length > 0 }))
  }, [])

  const handleNewPost = useCallback((post: SocialPost) => {
    setPosts(prev => [post, ...prev])
  }, [])

  const handleStageUpdate = useCallback((matchId: string, newStage: MatchStage) => {
    setMatchProgress(prev =>
      prev.map(m => m.id === matchId ? { ...m, stage: newStage, updatedAt: new Date() } : m)
    )
  }, [])

  const stats = useMemo(() => {
    const all = [...MOCK_FEMALE_PROFILES, ...MOCK_MALE_PROFILES]
    const active = all.filter(p => p.lockedAt !== null && lockRemainingMs(p.lockedAt) > 0).length
    const urgent = all.filter(p => computeStatus(p) === 'bright_red').length
    return { totalF: MOCK_FEMALE_PROFILES.length, totalM: MOCK_MALE_PROFILES.length, active, urgent }
  }, [])

  const myLeaderboardEntry = useMemo(
    () => MOCK_LEADERBOARD.find(e => e.email === currentEmail) ?? null,
    [currentEmail]
  )

  const tabLabel = (which: Tab) => which === 'bachurot' ? d.bachurot : d.bachurim
  const tabCount = (which: Tab) => which === 'bachurot' ? stats.totalF : stats.totalM

  return (
    <div className="min-h-screen bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Global Announcement Bar ── */}
      <AnnouncementBar
        announcement={announcement}
        isAdmin={isAdmin}
        locale={locale}
        onUpdate={handleAnnouncementUpdate}
      />

      {/* ── Page header ── */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/${locale}`} className="text-xs text-navy-400 hover:text-navy-600 transition-colors">
                {d.breadcrumb}
              </Link>
              <span className="text-gray-300 text-xs">/</span>
              <span className="text-xs text-gray-500">
                {isHe ? 'מרכז תקשורת וביצועים' : 'Communication & Performance Hub'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-navy-700 font-serif">
              {isHe ? 'מרכז תקשורת וביצועים' : 'Communication & Performance Hub'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{d.subtitle}</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {session && <UserBadge session={session} locale={locale} onLogout={handleLogout} />}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <LegendItem color="#22c55e" label={d.legend.green} />
            <LegendItem color="#f97316" label={d.legend.orange} />
            <LegendItem color="#f87171" label={d.legend.lightRed} />
            <LegendItem color="#dc2626" label={d.legend.brightRed} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value={stats.totalF} label={d.bachurot}      color="navy"   icon="👩" />
          <StatCard value={stats.totalM} label={d.bachurim}      color="navy"   icon="👨" />
          <StatCard value={stats.active} label={d.activeMatches} color="green"  icon="🔒" />
          <StatCard value={stats.urgent} label={d.urgent}        color="red"    icon="🚨" />
        </div>

        {/* ── Social Wall + Performance Scorecard ── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Social Wall (2/3 width on large screens) */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <SectionHeader
                emoji="💬"
                title={isHe ? 'חומת עדכונים – Social Wall' : 'Social Wall'}
                subtitle={isHe ? 'שתף עדכונים ותייג מועמדים' : 'Share updates and tag candidates'}
              />
              <SocialWall
                posts={posts}
                currentUserName={session?.name ?? ''}
                currentUserEmail={currentEmail}
                locale={locale}
                onNewPost={handleNewPost}
              />
            </div>

            {/* Performance Scorecard (1/3 width) */}
            <div className="flex flex-col gap-3">
              <SectionHeader
                emoji="⭐"
                title={isHe ? 'ביצועים אישיים' : 'My Performance'}
                subtitle={isHe ? 'הסטטיסטיקות שלך' : 'Your personal stats'}
              />
              <PerformanceScorecard entry={myLeaderboardEntry} locale={locale} />
            </div>
          </div>
        </section>

        {/* ── Match Progress Tracker ── */}
        <section>
          <MatchProgressSection
            matches={matchProgress}
            isAdmin={isAdmin}
            currentUserEmail={currentEmail}
            locale={locale}
            onStageUpdate={handleStageUpdate}
          />
        </section>

        {/* ── Admin Leaderboard (admin only) ── */}
        {isAdmin && (
          <section>
            <AdminLeaderboard entries={MOCK_LEADERBOARD} locale={locale} />
          </section>
        )}

        {/* ── Tab bar + Profiles table ── */}
        <section className="flex flex-col gap-4">
          <SectionHeader
            emoji="📋"
            title={isHe ? 'רשימת מועמדים' : 'Candidate List'}
          />
          <div className="flex gap-2">
            {(['bachurot', 'bachurim'] as Tab[]).map(which => (
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
                <span className={`ms-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === which ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-600'
                }`}>
                  {tabCount(which)}
                </span>
              </button>
            ))}
          </div>

          <ProfilesTable
            key={tab}
            profiles={tab === 'bachurot' ? MOCK_FEMALE_PROFILES : MOCK_MALE_PROFILES}
            gender={tab === 'bachurot' ? 'female' : 'male'}
            locale={locale}
          />
        </section>

        {/* ── Status guide ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-card px-6 py-5">
          <h2 className="text-sm font-bold text-navy-600 mb-4">{d.statusGuide}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { color: '#22c55e', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  title: d.statusGuideItems.greenTitle,     desc: d.statusGuideItems.greenDesc },
              { color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', title: d.statusGuideItems.orangeTitle,    desc: d.statusGuideItems.orangeDesc },
              { color: '#f87171', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-400',    title: d.statusGuideItems.lightRedTitle,  desc: d.statusGuideItems.lightRedDesc },
              { color: '#dc2626', bg: 'bg-red-100',   border: 'border-red-300',    text: 'text-red-700',    title: d.statusGuideItems.brightRedTitle, desc: d.statusGuideItems.brightRedDesc },
            ].map(item => (
              <div key={item.title} className={`rounded-xl border ${item.bg} ${item.border} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}88` }} />
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
