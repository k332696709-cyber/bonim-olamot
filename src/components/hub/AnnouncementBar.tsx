'use client'

import { useState } from 'react'
import type { Announcement } from '@/types/hub'

interface AnnouncementBarProps {
  announcement: Announcement
  isAdmin: boolean
  locale: string
  onUpdate: (text: string) => void
}

export function AnnouncementBar({ announcement, isAdmin, locale, onUpdate }: AnnouncementBarProps) {
  const isHe = locale === 'he'
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(announcement.text)

  if (!announcement.active && !isAdmin) return null

  return (
    <div className="bg-navy-700 text-white px-6 py-2.5" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="text-base shrink-0">📢</span>
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onUpdate(draft); setEditing(false) }
                if (e.key === 'Escape') setEditing(false)
              }}
              className="flex-1 bg-navy-600 text-white placeholder-navy-300 rounded-lg px-3 py-1 text-sm
                border border-navy-400 focus:outline-none focus:ring-1 focus:ring-white"
              placeholder={isHe ? 'כתוב הודעה לכל השדכנים...' : 'Write announcement for all matchmakers...'}
            />
            <button
              onClick={() => { onUpdate(draft); setEditing(false) }}
              className="shrink-0 text-xs bg-white text-navy-700 px-3 py-1.5 rounded-lg font-semibold
                hover:bg-navy-100 transition-colors"
            >
              {isHe ? 'שמור' : 'Save'}
            </button>
            <button
              onClick={() => { setDraft(announcement.text); setEditing(false) }}
              className="shrink-0 text-xs text-navy-300 hover:text-white transition-colors"
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
          </div>
        ) : (
          <>
            <p className="flex-1 text-sm font-medium leading-snug">
              {announcement.active
                ? announcement.text
                : <span className="opacity-50 italic">{isHe ? '— אין הודעה פעילה —' : '— No active announcement —'}</span>
              }
            </p>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 text-[11px] text-navy-300 hover:text-white transition-colors
                  border border-navy-500 rounded-lg px-2.5 py-1 hover:border-navy-400"
              >
                ✏️ {isHe ? 'ערוך הודעה' : 'Edit'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
