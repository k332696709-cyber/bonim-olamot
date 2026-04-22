'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getCandidateSession,
  setCandidateSession,
  clearCandidateSession,
  updateCandidateStatus,
  DEMO_SESSIONS,
  type CandidateSession,
} from '@/lib/auth/candidateSession'

// ─── Gender & locale-aware strings ───────────────────────────────────────────

function gT(gender: 'male' | 'female' | null, locale = 'he') {
  const isHe = locale === 'he'
  if (!gender) return {
    welcome:           isHe ? 'שלום'              : 'Hello',
    candidateNoun:     isHe ? 'מועמד/ת'           : 'Candidate',
    active:            isHe ? 'פעיל/ה'            : 'Active',
    paused:            isHe ? 'מוקפא/ת'           : 'On Hold',
    activeDesc:        isHe ? 'פעיל/ה – בתהליך חיפוש' : 'Active – searching for a match',
    pausedDesc:        isHe ? 'מוקפא/ת – לא בתהליך כרגע' : 'On Hold – not in process',
    editProfile:       isHe ? 'עריכת פרופיל'      : 'Edit Profile',
    registerLink:      '/register/male',
    suggestionsTitle:  isHe ? 'הצעות שקיבלת'      : 'Your Suggestions',
    suggestionsSubtitle: isHe ? 'הצעות שידוך שנשלחו אלייך' : 'Match suggestions sent to you',
    partnerLabel:      isHe ? 'מועמד/ת מומלצ/ת'   : 'Recommended Candidate',
    profileTitle:      isHe ? 'הפרופיל שלי'        : 'My Profile',
    notRegistered:     isHe ? 'עדיין לא נרשמת?'   : 'Not registered yet?',
    statusToggleHint:  isHe ? 'ניתן להחליף סטטוס בכל עת' : 'You can change your status at any time',
  }
  if (gender === 'male') return {
    welcome:           isHe ? 'ברוך הבא'          : 'Welcome',
    candidateNoun:     isHe ? 'מועמד'              : 'Candidate',
    active:            isHe ? 'פעיל'               : 'Active',
    paused:            isHe ? 'מוקפא'              : 'On Hold',
    activeDesc:        isHe ? 'פעיל – מחפש שידוך' : 'Active – seeking a match',
    pausedDesc:        isHe ? 'מוקפא – לא בתהליך כרגע' : 'On Hold – not in process',
    editProfile:       isHe ? 'עריכת פרופיל'       : 'Edit Profile',
    registerLink:      '/register/male',
    suggestionsTitle:  isHe ? 'הצעות שקיבלת'       : 'Your Suggestions',
    suggestionsSubtitle: isHe ? 'הצעות שידוך שנשלחו אלייך על ידי שדכן/ית' : 'Match suggestions sent to you by a matchmaker',
    partnerLabel:      isHe ? 'בחורה מומלצת'        : 'Recommended Match',
    profileTitle:      isHe ? 'הפרופיל שלי'         : 'My Profile',
    notRegistered:     isHe ? 'עדיין לא נרשמת?'    : 'Not registered yet?',
    statusToggleHint:  isHe ? 'ניתן לשנות סטטוס בכל עת' : 'You can change your status at any time',
  }
  return {
    welcome:           isHe ? 'ברוכה הבאה'         : 'Welcome',
    candidateNoun:     isHe ? 'מועמדת'              : 'Candidate',
    active:            isHe ? 'פעילה'               : 'Active',
    paused:            isHe ? 'מוקפאת'              : 'On Hold',
    activeDesc:        isHe ? 'פעילה – מחפשת שידוך' : 'Active – seeking a match',
    pausedDesc:        isHe ? 'מוקפאת – לא בתהליך כרגע' : 'On Hold – not in process',
    editProfile:       isHe ? 'עריכת פרופיל'        : 'Edit Profile',
    registerLink:      '/register/female',
    suggestionsTitle:  isHe ? 'הצעות שקיבלת'        : 'Your Suggestions',
    suggestionsSubtitle: isHe ? 'הצעות שידוך שנשלחו אלייך על ידי שדכן/ית' : 'Match suggestions sent to you by a matchmaker',
    partnerLabel:      isHe ? 'בחור מומלץ'           : 'Recommended Match',
    profileTitle:      isHe ? 'הפרופיל שלי'          : 'My Profile',
    notRegistered:     isHe ? 'עדיין לא נרשמת?'     : 'Not registered yet?',
    statusToggleHint:  isHe ? 'ניתן לשנות סטטוס בכל עת' : 'You can change your status at any time',
  }
}

// ─── Label helpers ─────────────────────────────────────────────────────────────

const STYLE_LABELS: Record<string, string> = {
  yeshivish: 'ישיבתי', open_ish: 'פתוח-ישיבתי', open: 'פתוח',
  modern: 'מודרני', very_modern: 'מודרני מאוד',
  shmura: 'שמורה', very_modern_f: 'מודרנית מאוד',
}

const STATUS_LABELS: Record<string, string> = {
  single: 'רווק/ה', divorced: 'גרוש/ה', widowed: 'אלמן/ה',
}

// ─── Mock suggestions data ─────────────────────────────────────────────────────

interface Suggestion {
  id: string
  firstName: string
  age: number
  city: string
  styleLabel: string
  community: string
  matchmakerNote: string
  sentDate: string
  responseStatus: 'pending' | 'accepted' | 'declined'
}

const SUGGESTIONS_FOR_MALE: Suggestion[] = [
  {
    id: 's-f1', firstName: 'רחל', age: 24, city: 'ירושלים',
    styleLabel: 'מודרנית', community: 'דתי לאומי',
    matchmakerNote: 'בחורה רצינית ומוכנה, מורה לאמנות. פתוחה ומחפשת בחור עם ערכים ועם ראש על הכתפיים.',
    sentDate: '20 בינואר 2026', responseStatus: 'pending',
  },
  {
    id: 's-f2', firstName: 'מרים', age: 26, city: 'תל אביב',
    styleLabel: 'פתוחה', community: 'מסורתי',
    matchmakerNote: 'אחות מוסמכת, חיה ושמחה. מחפשת בחור נורמלי עם כיוון בחיים ויכולת להיות נוכח.',
    sentDate: '5 בפברואר 2026', responseStatus: 'accepted',
  },
  {
    id: 's-f3', firstName: 'שרה', age: 22, city: 'בני ברק',
    styleLabel: 'שמורה', community: 'חרדי – ליטאי',
    matchmakerNote: 'סטודנטית מחונכת ועצמאית. מחפשת בחור ישיבתי שלומד בכולל ושיודע מה הוא רוצה.',
    sentDate: '10 במרץ 2026', responseStatus: 'pending',
  },
]

const SUGGESTIONS_FOR_FEMALE: Suggestion[] = [
  {
    id: 's-m1', firstName: 'יוסי', age: 27, city: 'ירושלים',
    styleLabel: 'מודרני', community: 'דתי לאומי',
    matchmakerNote: 'בחור אחראי ובוגר, עובד בהיי-טק. יציב, תקשורתי ומחפש מישהי שיודעת מה היא רוצה.',
    sentDate: '15 בינואר 2026', responseStatus: 'pending',
  },
  {
    id: 's-m2', firstName: 'אהרן', age: 25, city: 'בני ברק',
    styleLabel: 'ישיבתי', community: 'חרדי – ליטאי',
    matchmakerNote: 'תלמיד חכם מיוחד ועמוק. לומד בכולל, ממשפחה מכובדת. מחפש בחורה שקטה ורצינית.',
    sentDate: '1 במרץ 2026', responseStatus: 'accepted',
  },
  {
    id: 's-m3', firstName: 'שמואל', age: 24, city: 'רמת גן',
    styleLabel: 'פתוח', community: 'מסורתי',
    matchmakerNote: 'בחור שמח וחברותי, לומד ועובד. מחפש בחורה חמה ואוהבת חיים.',
    sentDate: '8 במרץ 2026', responseStatus: 'declined',
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status, gender, locale = 'he' }: { status: 'active' | 'paused'; gender: 'male' | 'female'; locale?: string }) {
  const t = gT(gender, locale)
  const isActive = status === 'active'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
      ${isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-orange-100 text-orange-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-orange-400'}`} />
      {isActive ? t.active : t.paused}
    </span>
  )
}

function ResponseBadge({ status, locale = 'he' }: { status: Suggestion['responseStatus']; locale?: string }) {
  const isHe = locale === 'he'
  const map = {
    pending:  { label: isHe ? 'ממתין לתשובה'    : 'Awaiting response', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    accepted: { label: isHe ? 'קיבלת / הסכמת'  : 'Accepted',          cls: 'bg-green-50 text-green-700 border-green-200' },
    declined: { label: isHe ? 'סירבת'           : 'Declined',          cls: 'bg-red-50  text-red-600   border-red-200'   },
  }[status]
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map.cls}`}>
      {map.label}
    </span>
  )
}

// ─── Welcome screen ────────────────────────────────────────────────────────────

function WelcomeView({
  locale,
  onDemo,
}: {
  locale: string
  onDemo: (gender: 'male' | 'female') => void
}) {
  const isHe = locale === 'he'
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 bg-gray-50"
      dir={isHe ? 'rtl' : 'ltr'}>
      <div className="max-w-lg w-full text-center">
        <span className="text-5xl">👤</span>
        <h1 className="text-3xl font-serif font-bold text-navy-800 mt-4 mb-2">
          {isHe ? 'אזור אישי' : 'Personal Area'}
        </h1>
        <p className="text-gray-500 text-base mb-10">
          {isHe
            ? 'כניסה לפרופיל האישי ולניהול ההצעות שלך'
            : 'Access your personal profile and manage your suggestions'}
        </p>

        {/* Gender cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          {/* Male */}
          <div className="bg-white rounded-2xl border-2 border-navy-100 shadow-card p-6 flex flex-col gap-4 items-center text-center">
            <div className="w-14 h-14 rounded-full bg-navy-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-navy-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-navy-700 text-lg">{isHe ? 'מועמד (בחור)' : 'Male Candidate'}</p>
              <p className="text-gray-400 text-sm mt-1">{isHe ? 'כניסה לאזור המועמדים' : 'Access candidate area'}</p>
            </div>
            <button
              onClick={() => onDemo('male')}
              className="w-full py-2.5 rounded-xl bg-navy-600 text-white text-sm font-semibold
                hover:bg-navy-700 transition-colors"
            >
              {isHe ? 'כניסה לדמו ←' : 'Demo Login →'}
            </button>
            <Link
              href={`/${locale}/register/male`}
              className="text-xs text-navy-500 hover:underline"
            >
              {isHe ? 'עדיין לא נרשמת? הירשם כאן' : 'Not registered? Sign up here'}
            </Link>
          </div>

          {/* Female */}
          <div className="bg-white rounded-2xl border-2 border-burgundy-100 shadow-card p-6 flex flex-col gap-4 items-center text-center">
            <div className="w-14 h-14 rounded-full bg-burgundy-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-burgundy-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-burgundy-700 text-lg">{isHe ? 'מועמדת (בחורה)' : 'Female Candidate'}</p>
              <p className="text-gray-400 text-sm mt-1">{isHe ? 'כניסה לאזור המועמדות' : 'Access candidate area'}</p>
            </div>
            <button
              onClick={() => onDemo('female')}
              className="w-full py-2.5 rounded-xl bg-burgundy-600 text-white text-sm font-semibold
                hover:bg-burgundy-700 transition-colors"
            >
              {isHe ? 'כניסה לדמו ←' : 'Demo Login →'}
            </button>
            <Link
              href={`/${locale}/register/female`}
              className="text-xs text-burgundy-500 hover:underline"
            >
              {isHe ? 'עדיין לא נרשמת? הירשמי כאן' : 'Not registered? Sign up here'}
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {isHe
            ? '💡 הכניסה לדמו מציגה פרופיל לדוגמה — ללא פרטים אמיתיים'
            : '💡 Demo login shows a sample profile — no real data'}
        </p>
      </div>
    </div>
  )
}

// ─── Profile tab ───────────────────────────────────────────────────────────────

function ProfileTab({ session, locale }: { session: CandidateSession; locale: string }) {
  const isHe = locale === 'he'
  const t = gT(session.gender, locale)
  const isMale = session.gender === 'male'

  const fields = [
    { label: isHe ? 'גיל' : 'Age',        value: String(session.age) },
    { label: isHe ? 'עיר' : 'City',       value: session.city },
    { label: isHe ? 'קהילה' : 'Community', value: session.community },
    { label: isHe ? 'עיסוק' : 'Occupation', value: session.occupation },
    { label: isHe ? 'סגנון' : 'Style',    value: STYLE_LABELS[session.style] ?? session.style },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
          {isHe ? 'פרטים כלליים' : 'General Details'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-400 font-medium">{label}</span>
              <span className="text-sm font-semibold text-gray-800">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit button */}
      <Link
        href={`/${locale}${t.registerLink}`}
        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
          transition-colors shadow-card hover:shadow-luxury
          ${isMale
            ? 'bg-navy-600 text-white hover:bg-navy-700'
            : 'bg-burgundy-600 text-white hover:bg-burgundy-700'
          }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        {isHe ? t.editProfile : 'Edit Profile'}
      </Link>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center">
        {isHe
          ? 'עריכת הפרופיל תפתח את טופס ההרשמה עם הפרטים הקיימים'
          : 'Editing will open the registration form with your existing details'}
      </p>
    </div>
  )
}

// ─── Suggestions tab ───────────────────────────────────────────────────────────

function SuggestionsTab({ session, locale }: { session: CandidateSession; locale: string }) {
  const isHe = locale === 'he'
  const t = gT(session.gender, locale)
  const suggestions = session.gender === 'male' ? SUGGESTIONS_FOR_MALE : SUGGESTIONS_FOR_FEMALE

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">{t.suggestionsSubtitle}</p>

      {suggestions.map((s) => (
        <div
          key={s.id}
          className="bg-white rounded-2xl border border-gray-200 shadow-card p-5 flex flex-col gap-3"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-bold text-navy-800">
                {t.partnerLabel}: {s.firstName}
              </span>
              <span className="text-xs text-gray-500">
                {isHe ? 'גיל' : 'Age'} {s.age} · {s.city} · {s.styleLabel} · {s.community}
              </span>
            </div>
            <ResponseBadge status={s.responseStatus} locale={locale} />
          </div>

          {/* Matchmaker note */}
          <div className="bg-navy-50 rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-navy-600 mb-1">
              {isHe ? 'מה השדכן/ית כתב/ה:' : "Matchmaker's note:"}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{s.matchmakerNote}</p>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-gray-400">
              {isHe ? `נשלח: ${s.sentDate}` : `Sent: ${s.sentDate}`}
            </span>
            {s.responseStatus === 'pending' && (
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors">
                  {isHe ? 'מעוניינת/מעוניין' : 'Interested'}
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  {isHe ? 'לא מתאים/ה' : 'Not suitable'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard view ────────────────────────────────────────────────────────────

function DashboardView({
  session,
  locale,
  onLogout,
}: {
  session: CandidateSession
  locale: string
  onLogout: () => void
}) {
  const isHe = locale === 'he'
  const t = gT(session.gender, locale)
  const isMale = session.gender === 'male'
  const [activeTab, setActiveTab] = useState<'profile' | 'suggestions'>('profile')
  const [status, setStatus] = useState<'active' | 'paused'>(session.status)

  const accentText  = isMale ? 'text-navy-700'     : 'text-burgundy-700'
  const accentBg    = isMale ? 'bg-navy-600'        : 'bg-burgundy-600'
  const accentHover = isMale ? 'hover:bg-navy-700'  : 'hover:bg-burgundy-700'
  const accentBorder = isMale ? 'border-navy-400'   : 'border-burgundy-400'

  const handleStatusToggle = (next: 'active' | 'paused') => {
    setStatus(next)
    updateCandidateStatus(next)
  }

  const suggestionCount = (isMale ? SUGGESTIONS_FOR_MALE : SUGGESTIONS_FOR_FEMALE).length
  const pendingCount = (isMale ? SUGGESTIONS_FOR_MALE : SUGGESTIONS_FOR_FEMALE)
    .filter(s => s.responseStatus === 'pending').length

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Top welcome banner ── */}
      <div className={`${isMale ? 'bg-navy-700' : 'bg-burgundy-700'} text-white px-4 py-5`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium opacity-75 mb-0.5">{t.candidateNoun}</p>
            <h1 className="text-xl font-bold">
              {t.welcome}, {session.firstName}
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity underline shrink-0"
          >
            {isHe ? 'יציאה' : 'Logout'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* ── Status toggle card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-bold text-gray-700">
              {isHe ? 'הסטטוס שלי' : 'My Status'}
            </span>
            <StatusBadge status={status} gender={session.gender} locale={locale} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusToggle('active')}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors border-2
                ${status === 'active'
                  ? `${accentBg} ${accentHover} text-white border-transparent`
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {isHe ? `✓ ${t.active}` : `✓ Active`}
            </button>
            <button
              onClick={() => handleStatusToggle('paused')}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors border-2
                ${status === 'paused'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
            >
              {isHe ? `⏸ ${t.paused}` : `⏸ On Hold`}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-2">{t.statusToggleHint}</p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
          {[
            { id: 'profile',     label: t.profileTitle },
            { id: 'suggestions', label: `${t.suggestionsTitle} (${suggestionCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative
                ${activeTab === tab.id
                  ? `${accentText} bg-gray-50`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.label}
              {tab.id === 'suggestions' && pendingCount > 0 && (
                <span className="absolute top-2 inline-flex items-center justify-center
                  w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold ms-1">
                  {pendingCount}
                </span>
              )}
              {activeTab === tab.id && (
                <span className={`absolute bottom-0 inset-x-0 h-0.5 ${accentBg}`} />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'profile'
          ? <ProfileTab session={session} locale={locale} />
          : <SuggestionsTab session={session} locale={locale} />
        }
      </div>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function PersonalAreaClient({ locale }: { locale: string }) {
  const [session, setSession] = useState<CandidateSession | null>(null)
  const [loaded, setLoaded]   = useState(false)

  // Read from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setSession(getCandidateSession())
    setLoaded(true)
  }, [])

  const handleDemo = (gender: 'male' | 'female') => {
    const demo = DEMO_SESSIONS[gender]
    setCandidateSession(demo)
    setSession(demo)
  }

  const handleLogout = () => {
    clearCandidateSession()
    setSession(null)
  }

  // Avoid flash of wrong content while localStorage is read
  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 rounded-full border-2 border-navy-300 border-t-navy-600 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <WelcomeView locale={locale} onDemo={handleDemo} />
  }

  return (
    <DashboardView session={session} locale={locale} onLogout={handleLogout} />
  )
}
