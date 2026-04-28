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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const T = getT(locale)
  const isHe = locale === 'he'

  const handleExport = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/export/profile/${profileId}?gender=${gender}`, { method: 'POST' })

      if (!res.ok) {
        let detail = `HTTP ${res.status}`
        try {
          const body = await res.json()
          detail = body.detail ?? body.error ?? detail
        } catch { /* ignore */ }
        throw new Error(detail)
      }

      const blob = await res.blob()
      if (blob.size === 0) throw new Error(isHe ? 'קובץ ריק התקבל' : 'Empty file received')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profile-${profileId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[PdfExportButton]', msg)
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(null), 6000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={handleExport}
        className="gap-2"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {loading ? T.pdf.exporting : T.pdf.export}
      </Button>

      {errorMsg && (
        <p className="text-xs text-red-600 font-medium max-w-[220px] text-right leading-tight">
          {isHe ? `שגיאה: ${errorMsg}` : `Error: ${errorMsg}`}
        </p>
      )}
    </div>
  )
}
