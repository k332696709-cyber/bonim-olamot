'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/** "Messages by phone and SMS": two switches, saved as soon as they are toggled. Email is always on. */
export function NotificationSettings({
  he, initialSms, initialCalls, initialPhotosPrivate,
}: { he: boolean; initialSms: boolean; initialCalls: boolean; initialPhotosPrivate: boolean }) {
  const [priv, setPriv] = useState(initialPhotosPrivate)
  const [sms, setSms] = useState(initialSms)
  const [calls, setCalls] = useState(initialCalls)
  const [msg, setMsg] = useState('')

  const setters = { notifySms: setSms, notifyCalls: setCalls, photosPrivate: setPriv }
  const save = async (key: 'notifySms' | 'notifyCalls' | 'photosPrivate', value: boolean) => {
    const prev = key === 'notifySms' ? sms : key === 'notifyCalls' ? calls : priv
    setters[key](value)
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
      setters[key](prev)
      setMsg(he ? 'השמירה נכשלה. נסו שוב.' : 'Saving failed. Try again.')
    }
  }

  const row = (
    key: 'notifySms' | 'notifyCalls' | 'photosPrivate', on: boolean, title: string, text: string,
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
      <h3 className="font-bold text-navy-800 text-lg mt-3">{he ? 'פרטיות התמונות' : 'Photo privacy'}</h3>
      {row(
        'photosPrivate', priv,
        he ? 'להסתיר את התמונות שלי עד עניין הדדי' : 'Hide my photos until mutual interest',
        he
          ? 'כבוי: מועמדים אחרים רואים את התמונות שלך כבר בהצעה. פעיל: התמונות יוצגו להם רק אחרי שגם אתם מעוניינים.'
          : 'Off: other candidates see your photos in the proposal. On: they see them only after you are both interested.',
      )}
      {msg && <p className="text-sm text-navy-500" role="status">{msg}</p>}
    </div>
  )
}
