'use client'

import { useState } from 'react'

interface Props {
  locale: string
}

export function ContactForm({ locale }: Props) {
  const isHe = locale === 'he'

  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '', website: '' })
  const [errorMsg, setErrorMsg] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const labels = {
    name:    isHe ? 'שם מלא'    : 'Full Name',
    phone:   isHe ? 'טלפון'     : 'Phone',
    subject: isHe ? 'נושא'      : 'Subject',
    message: isHe ? 'הודעה'     : 'Message',
    send:    isHe ? 'שלח הודעה' : 'Send Message',
    sent:    isHe ? 'ההודעה נשלחה! נחזור אליך בהקדם.' : 'Message sent! We\'ll get back to you shortly.',
    error:   isHe ? 'שגיאה בשליחה. נסה שוב.' : 'Send failed. Please try again.',
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-[#f1f1f1] px-4 py-3 text-sm text-gray-800 ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent ' +
    'transition-all duration-150'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(data?.message ?? '')
        setStatus('error')
        return
      }
      setStatus('sent')
      setForm({ name: '', phone: '', subject: '', message: '', website: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-green-700 font-medium text-base">{labels.sent}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot: hidden from people, filled by bots */}
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="hidden" value={form.website}
        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {labels.name}
          </label>
          <input
            className={inputClass}
            type="text"
            required
            placeholder={isHe ? 'ישראל ישראלי' : 'John Smith'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {labels.phone}
          </label>
          <input
            className={inputClass}
            type="tel"
            required
            placeholder="050-1234567"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {labels.subject}
        </label>
        <input
          className={inputClass}
          type="text"
          required
          placeholder={isHe ? 'במה נוכל לעזור?' : 'How can we help?'}
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {labels.message}
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={5}
          required
          placeholder={isHe ? 'כתוב את הודעתך כאן...' : 'Write your message here...'}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {errorMsg || labels.error}{' '}
          {isHe ? 'אפשר גם לפנות בוואטסאפ או בטלפון: 053-379-0008' : 'You can also reach us on WhatsApp or by phone: 053-379-0008'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 w-full sm:w-auto sm:self-end px-8 py-3 rounded-full bg-burgundy-500 text-white
          text-sm font-semibold hover:bg-burgundy-600 active:bg-burgundy-700
          disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {status === 'sending'
          ? (isHe ? 'שולח...' : 'Sending…')
          : labels.send}
      </button>
    </form>
  )
}
