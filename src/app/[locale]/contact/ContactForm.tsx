'use client'

import { useState } from 'react'

interface Props {
  locale: string
}

export function ContactForm({ locale }: Props) {
  const isHe = locale === 'he'

  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
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
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 ' +
    'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-transparent ' +
    'transition-all duration-150'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Simulate async send — replace with real API call
    await new Promise((r) => setTimeout(r, 900))
    setStatus('sent')
    setForm({ name: '', phone: '', subject: '', message: '' })
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
        <p className="text-sm text-red-600 text-center">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 w-full sm:w-auto sm:self-end px-8 py-3 rounded-xl bg-navy-600 text-white
          text-sm font-semibold hover:bg-navy-700 active:bg-navy-800
          disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {status === 'sending'
          ? (isHe ? 'שולח...' : 'Sending…')
          : labels.send}
      </button>
    </form>
  )
}
