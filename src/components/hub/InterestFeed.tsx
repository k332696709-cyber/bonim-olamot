'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Brief { id: string; name: string; age: number | null; city: string }
interface Interest {
  at: string; mutual: boolean; from: Brief; to: Brief
  femaleId: string; maleId: string; matchId: string | null
}

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

/**
 * Interest that candidates pressed in the smart assistant: who is interested in whom, and whether
 * it is mutual. A matchmaker can open the match from here to move it forward.
 */
export function InterestFeed({ locale, onOpened }: { locale: string; onOpened?: () => void }) {
  const he = locale === 'he'
  const [list, setList] = useState<Interest[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/matchmaker/interests')
      if (!res.ok) throw new Error('bad')
      const json = await res.json()
      setList(json.interests ?? [])
    } catch {
      setError(he ? 'לא הצלחנו לטעון התעניינויות.' : 'Could not load interest.')
    }
  }, [he])

  useEffect(() => { load() }, [load])

  const open = async (i: Interest) => {
    const key = `${i.femaleId}|${i.maleId}`
    setBusy(key)
    setError('')
    try {
      const res = await authed('/api/matchmaker/open-match', { method: 'POST', body: JSON.stringify({ femaleId: i.femaleId, maleId: i.maleId }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      await load()
      onOpened?.()
    } catch (e) {
      setError(e instanceof Error && e.message !== 'bad' ? e.message : he ? 'הפתיחה נכשלה. נסו שוב.' : 'Could not open the match.')
    } finally {
      setBusy(null)
    }
  }

  const person = (p: Brief) => (
    <Link href={`/${locale}/matchmaker/profiles/${p.id}`} className="font-semibold text-navy-800 hover:underline">
      {p.name || '—'}
      <span className="font-normal text-navy-400">{p.age ? ` · ${p.age}` : ''}{p.city ? ` · ${p.city}` : ''}</span>
    </Link>
  )

  const mutualCount = (list ?? []).filter((i) => i.mutual).length

  return (
    <div className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-navy-800">{he ? 'התעניינויות של מועמדים' : 'Candidate interest'}</h2>
        <p className="text-sm text-navy-400">
          {he
            ? 'מי לחץ "מעוניין/ת" במי בעוזר החכם. עניין הדדי מסומן, ואפשר לפתוח שידוך ולקדם אותו.'
            : 'Who pressed "interested" in whom in the smart assistant. Mutual interest is marked; open a match to move it forward.'}
          {mutualCount > 0 && <span className="font-semibold text-burgundy-600">{he ? ` ${mutualCount} הדדיים.` : ` ${mutualCount} mutual.`}</span>}
        </p>
      </div>
      {error && <p className="text-sm text-burgundy-600" role="alert">{error}</p>}
      {list === null && !error && <p className="text-sm text-navy-400">{he ? 'טוען...' : 'Loading…'}</p>}
      {list && list.length === 0 && <p className="text-sm text-navy-500">{he ? 'עדיין אין התעניינויות.' : 'No interest yet.'}</p>}
      {list && list.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
          {list.map((i) => {
            const key = `${i.femaleId}|${i.maleId}`
            return (
              <li key={`${key}-${i.at}`} className="rounded-2xl border border-navy-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
                  {person(i.from)}
                  <span className="text-navy-400">{i.mutual ? '↔' : he ? 'מעוניין/ת ב' : '→'}</span>
                  {person(i.to)}
                  {i.mutual && <span className="rounded-full bg-burgundy-500 text-white text-[11px] font-bold px-2.5 py-0.5">{he ? 'הדדי' : 'Mutual'}</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-navy-400">{new Date(i.at).toLocaleDateString(he ? 'he-IL' : 'en-GB')}</span>
                  {i.matchId ? (
                    <span className="text-xs font-semibold text-green-700">{he ? '✓ השידוך נפתח' : '✓ Match open'}</span>
                  ) : (
                    <button
                      type="button" disabled={busy === key} onClick={() => open(i)}
                      className="h-10 px-5 rounded-full bg-navy-800 hover:bg-navy-700 disabled:opacity-60 text-white text-xs font-bold"
                    >
                      {he ? 'פתיחת שידוך' : 'Open match'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
