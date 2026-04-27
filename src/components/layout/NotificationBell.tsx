'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { getSession } from '@/lib/auth/session'

interface NotificationDef {
  id: string
  text: string
  href: string
}

interface Notification extends NotificationDef {
  read: boolean
}

interface NotificationBellProps {
  locale: string
}

const T = {
  he: {
    title: 'התראות',
    markRead: 'סמן הכל כנקרא',
    empty: 'אין התראות חדשות',
    close: 'סגור',
    matchmaker: [
      { id: 'mm1', text: 'מועמד חדש נרשם בסקטור שלך', href: '/he/matchmaker' },
      { id: 'mm2', text: 'עדכון מערכת לשדכנים',        href: '/he/matchmaker' },
      { id: 'mm3', text: 'הודעה חדשה לכלל הצוות',      href: '/he/matchmaker' },
    ] as NotificationDef[],
    candidate: [
      { id: 'c1', text: 'יש לך הצעת שידוך חדשה!',         href: '/he/personal' },
      { id: 'c2', text: 'סטטוס הפרופיל שלך עודכן',          href: '/he/personal' },
      { id: 'c3', text: 'גלה מקומות בילוי חדשים באזורך',    href: '/he/date-spots' },
    ] as NotificationDef[],
  },
  en: {
    title: 'Notifications',
    markRead: 'Mark all as read',
    empty: 'No new notifications',
    close: 'Close',
    matchmaker: [
      { id: 'mm1', text: 'New candidate registered in your sector', href: '/en/matchmaker' },
      { id: 'mm2', text: 'System update for matchmakers',            href: '/en/matchmaker' },
      { id: 'mm3', text: 'New global announcement for the team',     href: '/en/matchmaker' },
    ] as NotificationDef[],
    candidate: [
      { id: 'c1', text: 'You have a new match suggestion!',       href: '/en/personal' },
      { id: 'c2', text: 'Your profile status was updated',        href: '/en/personal' },
      { id: 'c3', text: 'Check out new dating spots in your area', href: '/en/date-spots' },
    ] as NotificationDef[],
  },
}

export function NotificationBell({ locale }: NotificationBellProps) {
  const [isOpen, setIsOpen]         = useState(false)
  const [notifications, setNots]    = useState<Notification[]>([])
  const [mounted, setMounted]       = useState(false)
  const [isMobile, setIsMobile]     = useState(false)
  const dropdownRef                 = useRef<HTMLDivElement>(null)
  const isHe                        = locale === 'he'
  const lang                        = isHe ? T.he : T.en

  // Hydration + role detection
  useEffect(() => {
    setMounted(true)
    const session       = getSession()
    const isMatchmaker  = session !== null
    const defs          = isMatchmaker ? lang.matchmaker : lang.candidate
    setNots(defs.map(d => ({ ...d, read: false })))
  }, [locale])

  // Mobile breakpoint detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : ''
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen, isMobile])

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (isMobile) return
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, isMobile])

  const unreadCount = notifications.filter(n => !n.read).length
  const hasUnread   = unreadCount > 0
  const close       = () => setIsOpen(false)
  const markAllRead = () => setNots(prev => prev.map(n => ({ ...n, read: true })))

  if (!mounted) return null

  /* ── Shared panel content ─────────────────────────────────────── */
  const panelContent = (dir: 'rtl' | 'ltr') => (
    <div dir={dir} className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-navy-700 text-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{lang.title}</span>
          {hasUnread && (
            <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-medium leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {/* Close button — always visible on mobile; desktop closes on outside click */}
        <button
          onClick={close}
          aria-label={lang.close}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Notification list */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <li className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <BellOffIcon />
            <span className="text-sm">{lang.empty}</span>
          </li>
        ) : (
          notifications.map(n => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={close}
                className={`flex items-start gap-3 px-4 py-4 text-sm transition-colors
                  active:bg-navy-100
                  ${n.read
                    ? 'bg-white text-gray-400 hover:bg-gray-50'
                    : 'bg-navy-50/40 text-gray-700 hover:bg-navy-50'
                  }`}
              >
                <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-navy-500'}`} />
                <span className={`flex-1 leading-snug ${n.read ? '' : 'font-medium'}`}>{n.text}</span>
                {/* Chevron */}
                <span className="shrink-0 self-center text-gray-300 text-xs">
                  {isHe ? '‹' : '›'}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>

      {/* Footer — mark as read */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          {hasUnread ? (
            <button
              onClick={markAllRead}
              className="w-full py-2 rounded-lg text-sm font-medium text-navy-700
                bg-navy-50 hover:bg-navy-100 active:bg-navy-200
                transition-colors touch-manipulation"
            >
              {lang.markRead}
            </button>
          ) : (
            <p className="text-xs text-center text-gray-400">{lang.empty}</p>
          )}
        </div>
      )}
    </div>
  )

  /* ── Bell trigger button ──────────────────────────────────────── */
  const bellButton = (
    <button
      onClick={() => setIsOpen(prev => !prev)}
      aria-label={lang.title}
      aria-expanded={isOpen}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg
        text-gray-600 hover:text-navy-600 hover:bg-navy-50 transition-colors duration-150"
    >
      <BellIcon />
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
      )}
    </button>
  )

  /* ── Desktop dropdown ─────────────────────────────────────────── */
  if (!isMobile) {
    return (
      <div ref={dropdownRef} className="relative">
        {bellButton}
        {isOpen && (
          <div
            className={`
              absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100
              z-50 overflow-hidden max-h-[70vh] flex flex-col
              ${isHe ? 'right-0' : 'left-0'}
            `}
          >
            {panelContent(isHe ? 'rtl' : 'ltr')}
          </div>
        )}
      </div>
    )
  }

  /* ── Mobile: bottom sheet via portal ─────────────────────────── */
  const sheet = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={close}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang.title}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl
          shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {panelContent(isHe ? 'rtl' : 'ltr')}
      </div>
    </>
  )

  return (
    <>
      {bellButton}
      {mounted && isOpen && createPortal(sheet, document.body)}
    </>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function BellOffIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className="text-gray-300">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.9 17.9 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
