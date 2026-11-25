'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Msg { id: string; mine: boolean; body: string; at: string }
interface Thread { matchmakerId: string; name: string; messages: Msg[] }

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

/** Messages from the matchmakers. The candidate can answer, but cannot start a conversation. */
export function MessagesTab({ he, onRead }: { he: boolean; onRead?: () => void }) {
  const [threads, setThreads] = useState<Thread[] | null>(null)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/candidate/messages')
      if (!res.ok) throw new Error('bad')
      setThreads((await res.json()).threads ?? [])
    } catch {
      setError(he ? 'לא הצלחנו לטעון את ההודעות.' : 'Could not load the messages.')
    }
  }, [he])

  // Opening the tab marks what was written to the person as read.
  useEffect(() => {
    load().then(() => authed('/api/candidate/messages', { method: 'PATCH' }).then(() => onRead?.()).catch(() => {}))
  }, [load, onRead])

  const send = async (matchmakerId: string) => {
    const text = (draft[matchmakerId] ?? '').trim()
    if (!text) return
    setBusy(matchmakerId)
    setError('')
    try {
      const res = await authed('/api/candidate/messages', { method: 'POST', body: JSON.stringify({ matchmakerId, body: text }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      setDraft((d) => ({ ...d, [matchmakerId]: '' }))
      await load()
    } catch (e) {
      setError(e instanceof Error && e.message !== 'bad' ? e.message : he ? 'השליחה נכשלה. נסו שוב.' : 'Sending failed. Try again.')
    } finally {
      setBusy(null)
    }
  }

  const when = (iso: string) => new Date(iso).toLocaleString(he ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[32px] bg-navy-800 text-white shadow-luxury px-6 py-6">
        <p className="text-xs font-semibold tracking-widest text-burgundy-300 mb-1">{he ? 'הודעות' : 'MESSAGES'}</p>
        <h2 className="text-2xl font-bold">
          {threads === null && !error ? (he ? 'טוענים...' : 'Loading…') : (threads ?? []).length === 0 ? (he ? 'עדיין אין הודעות' : 'No messages yet') : he ? 'ההודעות שלך' : 'Your messages'}
        </h2>
        <p className="text-sm text-navy-100 mt-1">
          {he ? 'כאן שדכנים כותבים לך, ואפשר להשיב להם.' : 'Matchmakers write to you here, and you can answer them.'}
        </p>
      </div>

      {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-4 py-3" role="alert">{error}</p>}

      {(threads ?? []).map((t) => (
        <section key={t.matchmakerId} className="rounded-[28px] bg-white shadow-card p-5 flex flex-col gap-4">
          <h3 className="font-bold text-navy-800">{t.name || (he ? 'שדכן/ית' : 'Matchmaker')}</h3>
          <ul className="flex flex-col gap-2.5">
            {t.messages.map((m) => (
              <li key={m.id} className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${m.mine ? 'self-end bg-burgundy-500 text-white' : 'self-start bg-[#f1f1f1] text-navy-800'}`}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-[10px] mt-1 ${m.mine ? 'text-white/70' : 'text-navy-400'}`}>{when(m.at)}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); send(t.matchmakerId) }} className="flex gap-2">
            <input
              value={draft[t.matchmakerId] ?? ''} maxLength={2000}
              onChange={(e) => setDraft((d) => ({ ...d, [t.matchmakerId]: e.target.value }))}
              placeholder={he ? 'כתבו תשובה...' : 'Write a reply…'}
              className="flex-1 h-12 rounded-full border border-navy-100 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
            />
            <button type="submit" disabled={busy === t.matchmakerId || !(draft[t.matchmakerId] ?? '').trim()} className="h-12 px-6 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-40 text-white text-sm font-bold">
              {he ? 'שליחה' : 'Send'}
            </button>
          </form>
        </section>
      ))}
    </div>
  )
}
