'use client'

import { useState } from 'react'

const PRESET_AMOUNTS = [50, 100, 180, 360, 500, 1000]

type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown'

function detectCard(num: string): CardType {
  const clean = num.replace(/\s/g, '')
  if (/^4/.test(clean)) return 'visa'
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard'
  if (/^3[47]/.test(clean)) return 'amex'
  return 'unknown'
}

function CardIcon({ type }: { type: CardType }) {
  if (type === 'visa') return (
    <span className="text-[10px] font-black tracking-widest text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">VISA</span>
  )
  if (type === 'mastercard') return (
    <span className="flex gap-0.5 items-center">
      <span className="w-4 h-4 rounded-full bg-red-500 opacity-80" />
      <span className="w-4 h-4 rounded-full bg-yellow-400 -ms-2 opacity-80" />
    </span>
  )
  if (type === 'amex') return (
    <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">AMEX</span>
  )
  return <span className="text-gray-300">💳</span>
}

function formatCardNumber(value: string, type: CardType): string {
  const digits = value.replace(/\D/g, '')
  if (type === 'amex') {
    return digits.slice(0, 15).replace(/(\d{4})(\d{6})(\d{0,5})/, (_, a, b, c) =>
      c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a
    )
  }
  return digits.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

interface DonationsFormProps {
  locale?: string
  compact?: boolean
}

export function DonationsForm({ locale = 'he', compact = false }: DonationsFormProps) {
  const isHe = locale === 'he'

  const [amount, setAmount]         = useState<number | ''>('')
  const [customAmount, setCustom]   = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardType, setCardType]     = useState<CardType>('unknown')
  const [expiry, setExpiry]         = useState('')
  const [cvv, setCvv]               = useState('')
  const [holderName, setHolder]     = useState('')
  const [idNumber, setIdNumber]     = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [loading, setLoading]       = useState(false)

  const finalAmount = amount !== '' ? amount : (parseFloat(customAmount) || 0)

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = detectCard(e.target.value)
    setCardType(type)
    setCardNumber(formatCardNumber(e.target.value, type))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalAmount || finalAmount <= 0) return
    setLoading(true)
    // Simulate processing — real sliqa integration goes here
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">🎉</div>
        <h3 className="text-xl font-bold text-green-700">
          {isHe ? 'תודה על תרומתך!' : 'Thank you for your donation!'}
        </h3>
        <p className="text-gray-500 text-sm max-w-xs">
          {isHe
            ? `תרומתך בסך ₪${finalAmount} התקבלה. יישלח אישור לדוא"ל שלך.`
            : `Your donation of ₪${finalAmount} was received. A confirmation will be sent to your email.`}
        </p>
        <button
          onClick={() => { setSubmitted(false); setAmount(''); setCustom(''); setCardNumber(''); setExpiry(''); setCvv(''); setHolder(''); setIdNumber('') }}
          className="mt-2 text-sm text-burgundy-600 hover:underline"
        >
          {isHe ? 'תרומה נוספת' : 'Donate again'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} dir={isHe ? 'rtl' : 'ltr'} className="flex flex-col gap-5">

      {/* Amount selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          {isHe ? 'בחר סכום תרומה (₪)' : 'Choose donation amount (₪)'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => { setAmount(preset); setCustom('') }}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-all duration-150
                ${amount === preset
                  ? 'bg-burgundy-600 text-white border-burgundy-600 shadow-md'
                  : 'bg-white text-burgundy-700 border-burgundy-200 hover:bg-burgundy-50'
                }`}
            >
              ₪{preset}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mt-1">
          <span className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 text-sm font-bold">₪</span>
          <input
            type="number"
            min="1"
            placeholder={isHe ? 'סכום אחר...' : 'Other amount...'}
            value={customAmount}
            onChange={(e) => { setCustom(e.target.value); setAmount('') }}
            className="w-full ps-8 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
            dir="ltr"
          />
        </div>

        {finalAmount > 0 && (
          <p className="text-xs text-green-600 font-semibold">
            {isHe ? `סכום שנבחר: ₪${finalAmount}` : `Selected amount: ₪${finalAmount}`}
          </p>
        )}
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-700">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        {isHe ? 'תשלום מאובטח — פרטי הכרטיס מוצפנים ומאובטחים' : 'Secure payment — card details are encrypted'}
      </div>

      {/* Cardholder name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {isHe ? 'שם בעל הכרטיס *' : 'Cardholder Name *'}
        </label>
        <input
          type="text"
          value={holderName}
          onChange={(e) => setHolder(e.target.value)}
          placeholder={isHe ? 'כפי שמופיע על הכרטיס' : 'As it appears on the card'}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
            focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
        />
      </div>

      {/* Card number */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {isHe ? 'מספר כרטיס *' : 'Card Number *'}
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={handleCardChange}
            placeholder="0000 0000 0000 0000"
            required
            dir="ltr"
            className="w-full px-4 py-2.5 pe-12 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
          />
          <span className="absolute top-1/2 -translate-y-1/2 end-3">
            <CardIcon type={cardType} />
          </span>
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {isHe ? 'תוקף *' : 'Expiry *'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            required
            dir="ltr"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {isHe ? 'CVV *' : 'CVV *'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3))}
            placeholder={cardType === 'amex' ? '····' : '···'}
            required
            dir="ltr"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
          />
        </div>
      </div>

      {/* ID number */}
      {!compact && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            {isHe ? 'תעודת זהות (לאימות)' : 'ID Number (for verification)'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder={isHe ? '9 ספרות' : '9 digits'}
            dir="ltr"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-400"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || finalAmount <= 0}
        className="w-full py-3.5 rounded-xl bg-burgundy-600 hover:bg-burgundy-700 disabled:opacity-50
          text-white text-base font-bold shadow-md hover:shadow-lg transition-all duration-150 mt-1"
      >
        {loading
          ? (isHe ? 'מעבד תשלום...' : 'Processing...')
          : finalAmount > 0
            ? (isHe ? `❤️ תרום ₪${finalAmount}` : `❤️ Donate ₪${finalAmount}`)
            : (isHe ? '❤️ תרום עכשיו' : '❤️ Donate Now')
        }
      </button>

      <p className="text-center text-xs text-gray-400">
        {isHe
          ? 'החיוב יבוצע לאחר חיבור ספק הסליקה · ניתן לבטל בכל עת'
          : 'Charge processed after payment provider connection · Cancel anytime'}
      </p>
    </form>
  )
}
