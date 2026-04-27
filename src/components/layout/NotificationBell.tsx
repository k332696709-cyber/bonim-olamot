'use client'

import { useState, useEffect, useRef } from 'react'
import { getSession } from '@/lib/auth/session'

interface Notification {
  id: string
  text: string
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
      { id: 'mm1', text: 'מועמד חדש נרשם בסקטור שלך' },
      { id: 'mm2', text: 'עדכון מערכת לשדכנים' },
      { id: 'mm3', text: 'הודעה חדשה לכלל הצוות' },
    ],
    candidate: [
      { id: 'c1', text: 'יש לך הצעת שידוך חדשה!' },
      { id: 'c2', text: 'הפרופיל שלך אושר' },
      { id: 'c3', text: 'גלה מקומות בילוי חדשים באזורך' },
    ],
  },
  en: {
    title: 'Notifications',
    markRead: 'Mark all as read',
    empty: 'No new notifications',
    close: 'Close',
    matchmaker: [
      { id: 'mm1', text: 'New candidate registered in your sector' },
      { id: 'mm2', text: 'System update for matchmakers' },
      { id: 'mm3', text: 'New global announcement for the team' },
    ],
    candidate: [
      { id: 'c1', text: 'You have a new match suggestion!' },
      { id: 'c2', text: 'Your profile was approved' },
      { id: 'c3', text: 'Check out new dating spots in your area' },
    ],
  },
}

export function NotificationBell({ locale }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isHe = locale === 'he'
  const lang = isHe ? T.he : T.en

  useEffect(() => {
    setMounted(true)
    const session = getSession()
    const isMatchmaker = session !== null
    const demos = isMatchmaker ? lang.matchmaker : lang.candidate
    setNotifications(demos.map(d => ({ ...d, read: false })))
  }, [locale])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.read).length
  const hasUnread = unreadCount > 0

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (!mounted) return null

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={lang.title}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg
          text-gray-600 hover:text-navy-600 hover:bg-navy-50 transition-colors duration-150"
      >
        <BellIcon />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          dir={isHe ? 'rtl' : 'ltr'}
          className={`
            absolute top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100
            z-50 overflow-hidden
            ${isHe ? 'right-0' : 'left-0'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-700 text-white">
            <span className="font-semibold text-sm">{lang.title}</span>
            {hasUnread && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-medium">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notification list */}
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">{lang.empty}</li>
            ) : (
              notifications.map(n => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
                    n.read ? 'bg-white text-gray-400' : 'bg-navy-50/40 text-gray-700'
                  }`}
                >
                  <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-navy-500'}`} />
                  <span className={n.read ? '' : 'font-medium'}>{n.text}</span>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              {hasUnread ? (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-navy-600 hover:text-navy-800 transition-colors"
                >
                  {lang.markRead}
                </button>
              ) : (
                <span className="text-xs text-gray-400">{lang.empty}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
