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
  const isHe = locale === 'he'

  const handleExport = async () => {
    setLoading(true)
    try {
      const url = `/api/export/profile/${profileId}?gender=${gender}&type=full&locale=${locale}`
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `resume-${profileId}.pdf`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      onClick={handleExport}
      className="gap-2"
    >
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
  )
}
