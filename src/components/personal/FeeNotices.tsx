'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Fee {
  id: string
  amount: number
  sentAt: string
  matchmaker: string
  acknowledged: boolean
}

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

/**
 * Matchmaking-fee notices a matchmaker sent to the signed-in candidate. The candidate confirms
 * they saw the amount; the matchmaker sees that confirmation. Renders nothing when there are none.
 */
export function FeeNotices({ he }: { he: boolean }) {
  const [fees, setFees] = useState<Fee[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/candidate/fees')
      if (!res.ok) return
      const json = await res.json()
      setFees(json.fees ?? [])
    } catch { /* nothing to show */ }
  }, [])

  useEffect(() => { load() }, [load])

  const acknowledge = async (id: string) => {
    setBusy(id)
    setError('')
    try {
      const res = await authed('/api/candidate/fees', { method: 'POST', body: JSON.stringify({ matchId: id }) })
      if (!res.ok) throw new Error('bad')
      await load()
    } catch {
      setError(he ? 'האישור נכשל. נסו שוב.' : 'Confirmation failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  if (fees.length === 0) return null

  return (
    <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-widest text-burgundy-500 mb-1">{he ? 'דמי שידוך' : 'MATCHMAKING FEE'}</p>
      <h2 className="text-xl font-bold text-navy-800 mb-1">{he ? 'עדכון מהשדכן/ית' : 'An update from your matchmaker'}</h2>
      <p className="text-sm text-navy-500 mb-4">
        {he
          ? 'הסכום משולם רק לאחר סגירת האירוסין, ולא בשלבים קודמים.'
          : 'The amount is paid only after the engagement is finalized, and not at earlier stages.'}
      </p>
      <div className="flex flex-col gap-3">
        {fees.map((f) => (
          <div key={f.id} className="rounded-2xl bg-[#f1f1f1] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-2xl font-bold text-navy-800 tabular-nums" dir="ltr">
                {f.amount.toLocaleString(he ? 'he-IL' : 'en-GB')} {he ? 'ש"ח' : 'NIS'}
              </p>
              <p className="text-xs text-navy-500 mt-0.5">
                {f.matchmaker && (he ? `מאת ${f.matchmaker} · ` : `From ${f.matchmaker} · `)}
                {new Date(f.sentAt).toLocaleDateString(he ? 'he-IL' : 'en-GB')}
              </p>
            </div>
            {f.acknowledged ? (
              <span className="rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-5 py-2.5 text-center">
                {he ? '✓ אישרתי שקראתי' : '✓ Confirmed'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => acknowledge(f.id)}
                disabled={busy === f.id}
                className="h-11 px-6 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold"
              >
                {busy === f.id ? (he ? 'שומר...' : 'Saving…') : (he ? 'קראתי ומאשר/ת' : 'I have read this')}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-burgundy-500 mt-3" role="alert">{error}</p>}
    </div>
  )
}
