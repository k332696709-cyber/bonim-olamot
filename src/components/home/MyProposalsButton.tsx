'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loadCandidate, type CandidateState } from '@/lib/auth/candidate'
import { questionnaireProgress } from '@/lib/registration/completion'
import { FEMALE_FORM, MALE_FORM } from '@/constants/registrationForms'

/**
 * On the home page, a signed-in candidate gets a button straight to their suggestions (with how many
 * are waiting), or to the questionnaire if it is not finished. Nothing is shown to anyone else.
 */
export function MyProposalsButton({ locale }: { locale: string }) {
  const he = locale === 'he'
  const [cand, setCand] = useState<CandidateState | null>(null)
  const [waiting, setWaiting] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const c = await loadCandidate()
      if (!alive) return
      setCand(c)
      if (c.status !== 'approved') return
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch('/api/candidate/proposals', { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        if (!res.ok) return
        const json = await res.json()
        if (alive) setWaiting((json.proposals ?? []).filter((p: { state: string }) => p.state === 'none').length)
      } catch { /* the button still works without the number */ }
    })()
    return () => { alive = false }
  }, [])

  if (!cand || (cand.status !== 'approved' && cand.status !== 'pending')) return null

  if (cand.status === 'pending') {
    const pct = questionnaireProgress(cand.gender === 'female' ? FEMALE_FORM : MALE_FORM, cand.answers ?? {}).percent
    return (
      <div className="mb-8 flex justify-center lg:justify-start">
        <Link
          href={`/${locale}/personal/questionnaire`}
          className="inline-flex items-center gap-3 rounded-full bg-burgundy-400 hover:bg-burgundy-300 text-white font-bold h-14 px-8 text-lg glow-burgundy"
        >
          {he ? `להשלמת השאלון (${pct}%)` : `Finish the questionnaire (${pct}%)`}
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-8 flex justify-center lg:justify-start">
      <Link
        href={`/${locale}/personal#proposals`}
        className="inline-flex items-center gap-3 rounded-full bg-burgundy-400 hover:bg-burgundy-300 text-white font-bold h-14 px-8 text-lg glow-burgundy"
      >
        {he ? 'ההצעות שלי' : 'My suggestions'}
        {waiting !== null && waiting > 0 && (
          <span className="min-w-7 h-7 px-2 rounded-full bg-white text-burgundy-600 text-sm font-bold inline-flex items-center justify-center tabular-nums">
            {waiting}
          </span>
        )}
      </Link>
    </div>
  )
}
