'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Msg { id: string; fromCandidate: boolean; body: string; at: string; matchmaker: string; mine: boolean }

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

/** On a candidate's page: write to them on the site, and read their answers. */
export function CandidateMessages({ profileId, name }: { profileId: string; name: string }) {
  const [messages, setMessages] = useState<Msg[] | null>(null)
  const [reachable, setReachable] = useState(true)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await authed(`/api/matchmaker/messages?profileId=${profileId}`)
      if (!res.ok) throw new Error('bad')
      const json = await res.json()
      setMessages(json.messages ?? [])
      setReachable(json.reachable !== false)
    } catch {
      setNotice('לא הצלחנו לטעון את ההודעות.')
    }
  }, [profileId])
  useEffect(() => { load() }, [load])

  const send = async () => {
    if (!text.trim()) return
    setBusy(true)
    setNotice('')
    try {
      const res = await authed('/api/matchmaker/messages', { method: 'POST', body: JSON.stringify({ profileId, body: text }) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      setText('')
      setNotice('ההודעה נשלחה. המועמד/ת יקבל/תקבל גם מייל.')
      await load()
    } catch (e) {
      setNotice(e instanceof Error && e.message !== 'bad' ? e.message : 'השליחה נכשלה. נסו שוב.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 px-6 py-5 flex flex-col gap-3">
      <div>
        <h2 className="font-semibold text-navy-500 text-base">הודעות ל{name || 'מועמד/ת'}</h2>
        <p className="text-xs text-gray-400">
          ההודעה מופיעה באזור האישי של המועמד/ת, ונשלח גם מייל. אפשר לקבל תשובה כאן. שדכן רואה רק את השיחה שלו, והמנהל רואה את הכל.
        </p>
      </div>

      {messages === null && !notice && <p className="text-sm text-gray-400">טוען...</p>}
      {messages && messages.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {messages.map((m) => (
            <li key={m.id} className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm ${m.fromCandidate ? 'self-start bg-[#f1f1f1] text-navy-800' : 'self-end bg-navy-800 text-white'}`}>
              <p className={`text-[10px] mb-0.5 ${m.fromCandidate ? 'text-navy-400' : 'text-white/70'}`}>
                {m.fromCandidate ? name || 'המועמד/ת' : m.mine ? 'אני' : m.matchmaker || 'שדכן/ית'}
              </p>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.fromCandidate ? 'text-navy-400' : 'text-white/70'}`}>{new Date(m.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </li>
          ))}
        </ul>
      )}
      {messages && messages.length === 0 && reachable && <p className="text-sm text-gray-400">עדיין לא נכתבו הודעות.</p>}
      {!reachable && <p className="text-sm text-gray-500">למועמד/ת הזה אין חשבון באתר, ולכן אי אפשר לשלוח הודעה.</p>}

      {reachable && (
        <div className="flex flex-col gap-2">
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000}
            placeholder="כתבו הודעה..."
            className="rounded-2xl border border-navy-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
          />
          <div className="flex items-center gap-3">
            <button type="button" disabled={busy || !text.trim()} onClick={send} className="h-11 px-6 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-40 text-white text-sm font-bold">
              שליחה
            </button>
            {notice && <p className="text-sm text-navy-500" role="status">{notice}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
