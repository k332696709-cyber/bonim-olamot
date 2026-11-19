'use client'

import { useState } from 'react'
import { Turnstile } from '@/components/forms/Turnstile'
import { hebrewDate } from '@/lib/registration/birthDate'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The public form for announcing an engagement. The announcement waits for approval before it shows. */
export function EngagementForm({ locale }: { locale: string }) {
  const he = locale === 'he'
  const [v, setV] = useState({
    groomName: '', groomFather: '', groomCommunity: '', groomCity: '',
    brideName: '', brideFather: '', brideCommunity: '', brideCity: '',
    date: today(), website: '',
  })
  const [token, setToken] = useState('')
  const [reset, setReset] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }))
  const input = 'w-full h-12 rounded-2xl border border-navy-100 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!v.groomName.trim() || !v.brideName.trim()) return setError(he ? 'יש למלא את שם החתן ושם הכלה.' : 'Please fill in both names.')
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/engagements', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, turnstileToken: token }),
      })
      const json = await res.json().catch(() => ({}))
      setReset((n) => n + 1)
      if (!res.ok) { setError(json?.message ?? (he ? 'השליחה נכשלה.' : 'Sending failed.')); setStatus('idle'); return }
      setStatus('sent')
    } catch {
      setError(he ? 'השליחה נכשלה. בדקו את החיבור.' : 'Sending failed. Check your connection.')
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-[28px] bg-white shadow-card p-10 text-center">
        <p className="text-2xl font-bold text-navy-800 mb-2">{he ? 'מזל טוב! הבקשה התקבלה' : 'Mazal tov! We got your request'}</p>
        <p className="text-navy-500">{he ? 'המודעה תופיע בדף הבית אחרי שתאושר.' : 'The announcement will appear on the home page after approval.'}</p>
      </div>
    )
  }

  const side = (title: string, k: { name: keyof typeof v; father: keyof typeof v; community: keyof typeof v; city: keyof typeof v }) => (
    <fieldset className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-3">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg font-bold text-navy-800">{title}</h2>
      <input className={input} placeholder={he ? 'שם מלא *' : 'Full name *'} value={v[k.name]} onChange={set(k.name)} maxLength={80} />
      <input className={input} placeholder={he ? 'שם האב (בהר״ר ...)' : 'Father’s name'} value={v[k.father]} onChange={set(k.father)} maxLength={80} />
      <input className={input} placeholder={he ? 'חסידות או קהילה' : 'Community'} value={v[k.community]} onChange={set(k.community)} maxLength={80} />
      <input className={input} placeholder={he ? 'עיר' : 'City'} value={v[k.city]} onChange={set(k.city)} maxLength={80} />
    </fieldset>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {side(he ? 'החתן' : 'The groom', { name: 'groomName', father: 'groomFather', community: 'groomCommunity', city: 'groomCity' })}
      {side(he ? 'הכלה' : 'The bride', { name: 'brideName', father: 'brideFather', community: 'brideCommunity', city: 'brideCity' })}

      <div className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-2">
        <label htmlFor="eng-date" className="text-sm font-semibold text-navy-800">{he ? 'תאריך האירוסין' : 'Engagement date'}</label>
        <input id="eng-date" type="date" className={input} value={v.date} onChange={set('date')} />
        <p className="text-sm text-navy-400">{hebrewDate(v.date)}</p>
      </div>

      {/* Hidden field: only bots fill it. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={v.website} onChange={set('website')} />

      <Turnstile onToken={setToken} resetSignal={reset} locale={locale} />
      {error && <p className="text-sm text-burgundy-600" role="alert">{error}</p>}
      <button
        type="submit" disabled={status === 'sending'}
        className="h-14 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white font-bold"
      >
        {status === 'sending' ? (he ? 'שולחים...' : 'Sending…') : he ? 'שליחה לאישור' : 'Send for approval'}
      </button>
      <p className="text-xs text-navy-400 text-center">
        {he ? 'המודעה מתפרסמת רק אחרי אישור. פרסמו רק בהסכמת בני הזוג.' : 'Announcements are published only after approval. Please post with the couple’s consent.'}
      </p>
    </form>
  )
}
