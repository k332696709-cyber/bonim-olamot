'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { getT } from '@/lib/i18n/translations'

interface PdfExportButtonProps {
  profileId: string
  locale?: string
  gender?: 'female' | 'male'
}

export function PdfExportButton({ profileId, locale = 'he', gender = 'female' }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const T = getT(locale)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/export/profile/${profileId}?gender=${gender}`, { method: 'POST' })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profile-${profileId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={handleExport}
      className="gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {loading ? T.pdf.exporting : T.pdf.export}
    </Button>
  )
}
