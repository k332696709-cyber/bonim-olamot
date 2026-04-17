'use client'

import { useState } from 'react'
import type { Note } from '@/types/registration'
import { Button } from '@/components/ui/Button'
import { getT } from '@/lib/i18n/translations'

interface NotesThreadProps {
  notes: Note[]
  locale?: string
  onAddNote?: (text: string) => void
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function NotesThread({ notes, locale = 'he', onAddNote }: NotesThreadProps) {
  const [text, setText] = useState('')
  const T = getT(locale)
  const d = T.dashboard

  const handleAdd = () => {
    const trimmed = text.trim()
    if (!trimmed || !onAddNote) return
    onAddNote(trimmed)
    setText('')
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">{d.noNotes}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-navy-50 rounded-xl px-4 py-3 border border-navy-100">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-semibold text-navy-600 text-sm">{note.author}</span>
                <span className="text-gray-400 text-xs shrink-0">
                  {formatDate(note.createdAt, locale)}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      )}

      {onAddNote && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={T.placeholders.addNote}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm
              text-gray-900 placeholder:text-gray-400 bg-white resize-none
              focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400
              hover:border-navy-300 transition-colors duration-150"
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={handleAdd} disabled={!text.trim()}>
              {d.addNote}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
