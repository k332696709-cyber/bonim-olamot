'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/** "Messages by phone and SMS": two switches, saved as soon as they are toggled. Email is always on. */
export function NotificationSettings({
  he, initialSms, initialCalls,
}: { he: boolean; initialSms: boolean; initialCalls: boolean }) {
  const [sms, setSms] = useState(initialSms)
  const [calls, setCalls] = useState(initialCalls)
  const [msg, setMsg] = useState('')

  const save = async (key: 'notifySms' | 'notifyCalls', value: boolean) => {
    const prev = key === 'notifySms' ? sms : calls
    key === 'notifySms' ? setSms(value) : setCalls(value)
    setMsg('')
    try {
      const { data } = await createClient().auth.getSession()
      const res = await fetch('/api/candidate/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error('save failed')
      setMsg(he ? 'נשמר.' : 'Saved.')
    } catch {
      key === 'notifySms' ? setSms(prev) : setCalls(prev)
      setMsg(he ? 'השמירה נכשלה. נסו שוב.' : 'Saving failed. Try again.')
    }
  }

  const row = (
    key: 'notifySms' | 'notifyCalls', on: boolean, title: string, text: string,
  ) => (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-navy-100 p-4">
      <div className="flex flex-col gap-1">
        <span id={`${key}-label`} className="text-[15px] font-semibold text-navy-800">{title}</span>
        <p className="text-sm text-navy-400">{text}</p>
      </div>
      <button
        type="button" role="switch" aria-checked={on} aria-labelledby={`${key}-label`}
        onClick={() => save(key, !on)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-navy-800' : 'bg-navy-200'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-1' : 'end-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="rounded-[32px] bg-white shadow-card p-6 sm:p-8 flex flex-col gap-3">
      <h3 className="font-bold text-navy-800 text-lg">{he ? 'הודעות בטלפון ובמסרון' : 'Phone and SMS messages'}</h3>
      {row(
        'notifySms', sms,
        he ? 'קבלת מסרונים (SMS)' : 'Receive SMS messages',
        he
          ? 'פעיל: יישלח אליך מסרון כשיש עדכון בתיק שלך, למשל עניין הדדי או הצעות חדשות. עדכונים יגיעו גם במייל.'
          : 'On: you get a text message when your file has an update, such as mutual interest or new suggestions. Updates also arrive by email.',
      )}
      {row(
        'notifyCalls', calls,
        he ? 'קבלת שיחות טלפון' : 'Receive phone calls',
        he ? 'פעיל: ייתכן שנתקשר אליך כדי לעדכן על התיק שלך.' : 'On: we may call you with an update about your file.',
      )}
      {msg && <p className="text-sm text-navy-500" role="status">{msg}</p>}
    </div>
  )
}
