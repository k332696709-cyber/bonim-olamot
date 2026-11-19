'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hebrewDate } from '@/lib/registration/birthDate'

interface Row {
  id: string; status: 'pending' | 'published' | 'hidden'; source: string; engaged_on: string
  groom_name: string; groom_father: string | null; groom_community: string | null; groom_city: string | null
  bride_name: string; bride_father: string | null; bride_community: string | null; bride_city: string | null
}

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

const STATUS_HE = { pending: 'ממתינה לאישור', published: 'מפורסמת', hidden: 'מוסתרת' } as const

/** Engagement announcements for the matchmakers: approve, hide, delete, and fill in what is missing. */
export function EngagementAdmin() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, Partial<Row>>>({})

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/matchmaker/engagements')
      if (!res.ok) throw new Error('bad')
      setRows((await res.json()).engagements ?? [])
    } catch {
      setError('לא הצלחנו לטעון את המודעות.')
    }
  }, [])
  useEffect(() => { load() }, [load])

  const act = async (id: string, payload: Record<string, unknown>) => {
    setBusy(id); setError('')
    try {
      const res = await authed('/api/matchmaker/engagements', { method: 'PATCH', body: JSON.stringify({ id, ...payload }) })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message ?? 'bad')
      await load()
    } catch (e) {
      setError(e instanceof Error && e.message !== 'bad' ? e.message : 'הפעולה נכשלה.')
    } finally {
      setBusy(null)
    }
  }

  const field = (r: Row, k: keyof Row, placeholder: string) => (
    <input
      className="h-10 rounded-xl border border-navy-100 px-3 text-sm w-full"
      placeholder={placeholder}
      value={String((edits[r.id]?.[k] ?? r[k] ?? ''))}
      onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...s[r.id], [k]: e.target.value } }))}
    />
  )

  const pending = (rows ?? []).filter((r) => r.status === 'pending').length

  return (
    <div className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-navy-800">מודעות מאורסים</h2>
        <p className="text-sm text-navy-400">
          {'מודעה מופיעה בדף הבית רק אחרי שמפרסמים אותה. כששידוך מגיע ל"סגירת ווארט" נוצרת מודעה לאישור, ואפשר להשלים בה שם אב וחסידות.'}
          {pending > 0 && <span className="font-semibold text-burgundy-600"> {pending} ממתינות.</span>}
        </p>
      </div>
      {error && <p className="text-sm text-burgundy-600" role="alert">{error}</p>}
      {rows === null && !error && <p className="text-sm text-navy-400">טוען...</p>}
      {rows && rows.length === 0 && <p className="text-sm text-navy-500">אין מודעות עדיין.</p>}
      <ul className="flex flex-col gap-3 max-h-[560px] overflow-y-auto">
        {(rows ?? []).map((r) => (
          <li key={r.id} className="rounded-2xl border border-navy-100 p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-navy-800">{r.groom_name} ו{r.bride_name}</p>
              <span className={`rounded-full text-xs font-bold px-3 py-1 ${r.status === 'pending' ? 'bg-orange-500 text-white' : r.status === 'published' ? 'bg-green-600 text-white' : 'bg-navy-100 text-navy-600'}`}>
                {STATUS_HE[r.status]}{r.source === 'demo' ? ' · דמו' : r.source === 'match' ? ' · משידוך' : ''}
              </span>
            </div>
            <p className="text-xs text-navy-400">{hebrewDate(r.engaged_on)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {field(r, 'groom_name', 'שם החתן')}
              {field(r, 'bride_name', 'שם הכלה')}
              {field(r, 'groom_father', 'שם אב החתן')}
              {field(r, 'bride_father', 'שם אב הכלה')}
              {field(r, 'groom_community', 'חסידות/קהילה של החתן')}
              {field(r, 'bride_community', 'חסידות/קהילה של הכלה')}
              {field(r, 'groom_city', 'עיר החתן')}
              {field(r, 'bride_city', 'עיר הכלה')}
            </div>
            <div className="flex flex-wrap gap-2">
              {edits[r.id] && (
                <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { fields: edits[r.id] }).then(() => setEdits((s) => { const n = { ...s }; delete n[r.id]; return n }))}
                  className="h-10 px-5 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold disabled:opacity-60">שמירת שינויים</button>
              )}
              {r.status !== 'published' && (
                <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { status: 'published' })}
                  className="h-10 px-5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 text-white text-xs font-bold disabled:opacity-60">פרסום בדף הבית</button>
              )}
              {r.status === 'published' && (
                <button type="button" disabled={busy === r.id} onClick={() => act(r.id, { status: 'hidden' })}
                  className="h-10 px-5 rounded-full border border-navy-200 text-navy-700 text-xs font-bold disabled:opacity-60">הסתרה</button>
              )}
              <button type="button" disabled={busy === r.id} onClick={() => { if (window.confirm('למחוק את המודעה?')) act(r.id, { delete: true }) }}
                className="h-10 px-5 rounded-full border border-burgundy-300 text-burgundy-600 text-xs font-bold disabled:opacity-60">מחיקה</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
