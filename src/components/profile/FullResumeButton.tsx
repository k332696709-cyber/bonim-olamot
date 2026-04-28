'use client'

import { useState } from 'react'
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
      const url = `/api/export/profile/${profileId}?gender=${gender}&type=full&locale=${locale}`
      const res = await fetch(url, { method: 'POST' })

      if (!res.ok) {
        // Try to surface the server's error message
        let detail = `HTTP ${res.status}`
        try {
          const body = await res.json()
          detail = body.detail ?? body.error ?? detail
        } catch { /* ignore parse error */ }
        throw new Error(detail)
      }

      const blob = await res.blob()
      if (blob.size === 0) throw new Error(isHe ? 'קובץ ריק התקבל' : 'Empty file received')

      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `resume-${profileId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
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

      {errorMsg && (
        <p className="text-xs text-red-600 font-medium max-w-[220px] text-right leading-tight">
          {isHe ? `שגיאה: ${errorMsg}` : `Error: ${errorMsg}`}
        </p>
      )}
    </div>
  )
}
