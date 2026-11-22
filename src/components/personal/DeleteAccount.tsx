'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { clearSession } from '@/lib/auth/session'

/** "Delete my account": a small link, then a window that asks to be sure. It removes everything about the person. */
export function DeleteAccount({ he, locale }: { he: boolean; locale: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [sure, setSure] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setBusy(true)
    setError('')
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/candidate/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ confirm: true }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      await createClient().auth.signOut()
      clearSession()
      router.push(`/${locale}`)
    } catch (e) {
      setError(e instanceof Error && e.message !== 'bad' ? e.message : he ? 'המחיקה נכשלה. נסו שוב.' : 'Deleting failed. Try again.')
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex justify-center">
        <button type="button" onClick={() => { setSure(false); setError(''); setOpen(true) }} className="text-sm text-navy-400 hover:text-burgundy-600 underline">
          {he ? 'מחיקת החשבון שלי' : 'Delete my account'}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center px-4" onClick={() => !busy && setOpen(false)} dir={he ? 'rtl' : 'ltr'}>
          <div role="dialog" aria-modal="true" className="bg-white rounded-[28px] shadow-luxury w-full max-w-md p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-navy-800">{he ? 'למחוק את החשבון?' : 'Delete the account?'}</h3>
            <p className="text-sm text-navy-600">
              {he
                ? 'יימחקו הפרופיל, תשובות השאלון, התמונות והאזור האישי, וגם הצעות והתעניינויות שקשורות אליך. אי אפשר לשחזר. אפשר להירשם שוב בכל עת.'
                : 'Your profile, questionnaire answers, photos and personal area are deleted, along with suggestions and interest involving you. This cannot be undone. You can register again at any time.'}
            </p>
            <label className="flex items-start gap-3 text-sm text-navy-700">
              <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} className="mt-1 h-4 w-4" />
              {he ? 'אני מבין/ה שהמחיקה סופית' : 'I understand the deletion is final'}
            </label>
            {error && <p className="text-sm text-burgundy-600" role="alert">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button" disabled={!sure || busy} onClick={run}
                className="flex-1 h-12 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-40 text-white font-bold text-sm"
              >
                {busy ? (he ? 'מוחקים...' : 'Deleting…') : he ? 'מחיקת החשבון' : 'Delete the account'}
              </button>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} className="h-12 px-6 rounded-full border border-navy-200 text-navy-600 hover:bg-navy-50 text-sm font-medium">
                {he ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
