'use client'

import { useState } from 'react'
import { downloadProfilePdf } from '@/lib/pdf/download'
import { Button } from '@/components/ui/Button'

interface FullResumeButtonProps {
  profileId: string
  locale?: string
  gender?: 'female' | 'male'
}

export function FullResumeButton({
  profileId,
  locale = 'he',
  gender = 'female',
}: FullResumeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const isHe = locale === 'he'

  const handleExport = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      await downloadProfilePdf({ id: profileId, type: 'full', locale })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[FullResumeButton]', msg)
      setErrorMsg(msg)
      // Auto-clear error after 6 seconds
      setTimeout(() => setErrorMsg(null), 6000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="primary"
        size="sm"
        loading={loading}
        onClick={handleExport}
        className="gap-2"
      >
        {/* Document icon */}
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {loading
          ? (isHe ? 'מייצא...' : 'Exporting...')
          : (isHe ? 'קורות חיים מלאים' : 'Full Resume PDF')}
      </Button>

      <p className="text-[11px] text-gray-400 max-w-[220px] leading-tight">
        {isHe ? 'כל הפרטים והתשובות, כולל שם משפחה וטלפון. לשימוש פנימי.' : 'Every detail and answer, including surname and phone. Internal use.'}
      </p>

      {errorMsg && (
        <p className="text-xs text-red-600 font-medium max-w-[220px] text-right leading-tight">
          {isHe ? `שגיאה: ${errorMsg}` : `Error: ${errorMsg}`}
        </p>
      )}
    </div>
  )
}
