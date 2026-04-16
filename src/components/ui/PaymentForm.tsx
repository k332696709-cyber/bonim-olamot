'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './Label'
import { Input } from './Input'

interface PaymentFormProps {
  locale?: string
  onDataChange?: (data: PaymentData) => void
}

export interface PaymentData {
  cardholderName: string
  cardNumber: string
  expiry: string
  cvv: string
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

function detectCardType(number: string): 'visa' | 'mastercard' | 'amex' | null {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return null
}

const CardIcon = ({ type }: { type: 'visa' | 'mastercard' | 'amex' | null }) => {
  if (!type) return (
    <svg className="w-8 h-5 text-gray-300" fill="none" viewBox="0 0 32 20" stroke="currentColor">
      <rect x="1" y="1" width="30" height="18" rx="3" strokeWidth="1.5" />
      <line x1="1" y1="6" x2="31" y2="6" strokeWidth="2" />
    </svg>
  )
  const colors = { visa: '#1A1F71', mastercard: '#EB001B', amex: '#2E77BC' }
  const labels = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' }
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: colors[type], border: `1px solid ${colors[type]}` }}>
      {labels[type]}
    </span>
  )
}

const LockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

export function PaymentForm({ locale = 'he', onDataChange }: PaymentFormProps) {
  const t = locale === 'he'
  const [data, setData] = useState<PaymentData>({ cardholderName: '', cardNumber: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState<Partial<PaymentData>>({})
  const cardType = detectCardType(data.cardNumber)

  const update = (field: keyof PaymentData, raw: string) => {
    let value = raw
    if (field === 'cardNumber') value = formatCardNumber(raw)
    if (field === 'expiry') value = formatExpiry(raw)
    if (field === 'cvv') value = raw.replace(/\D/g, '').slice(0, 4)
    const next = { ...data, [field]: value }
    setData(next)
    onDataChange?.(next)
    // clear error on change
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Security badge */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <span className="text-green-600"><LockIcon /></span>
        <p className="text-green-700 text-xs font-medium">
          {t ? 'תשלום מאובטח — פרטי הכרטיס מוצפנים ומאובטחים' : 'Secure payment — card details are encrypted'}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-burgundy-50 border border-burgundy-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-burgundy-700 text-sm">{t ? 'מנוי פרימיום' : 'Premium Plan'}</p>
          <p className="text-burgundy-500 text-xs mt-0.5">{t ? '3 תשלומים חודשיים' : '3 monthly payments'}</p>
        </div>
        <div className="text-end">
          <p className="font-bold text-burgundy-600 text-lg">₪250</p>
          <p className="text-burgundy-400 text-xs">{t ? 'לחודש' : '/ month'}</p>
        </div>
      </div>

      {/* Card fields */}
      <div className="flex flex-col gap-4">

        {/* Cardholder name */}
        <div>
          <Label he="שם בעל הכרטיס" en="Cardholder Name" htmlFor="cardholderName" required />
          <Input
            id="cardholderName"
            placeholder={t ? 'כפי שמופיע על הכרטיס' : 'As it appears on the card'}
            value={data.cardholderName}
            onChange={(e) => update('cardholderName', e.target.value)}
            error={errors.cardholderName}
            autoComplete="cc-name"
          />
        </div>

        {/* Card number */}
        <div>
          <Label he="מספר כרטיס" en="Card Number" htmlFor="cardNumber" required />
          <div className="relative">
            <Input
              id="cardNumber"
              placeholder="0000 0000 0000 0000"
              value={data.cardNumber}
              onChange={(e) => update('cardNumber', e.target.value)}
              error={errors.cardNumber}
              numeric
              inputMode="numeric"
              autoComplete="cc-number"
              className="pe-12"
            />
            <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none">
              <CardIcon type={cardType} />
            </div>
          </div>
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label he="תוקף" en="Expiry" htmlFor="expiry" required />
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={data.expiry}
              onChange={(e) => update('expiry', e.target.value)}
              error={errors.expiry}
              numeric
              inputMode="numeric"
              autoComplete="cc-exp"
            />
          </div>
          <div>
            <Label he='CVV / קוד אבטחה' en="CVV" htmlFor="cvv" required />
            <Input
              id="cvv"
              placeholder="•••"
              value={data.cvv}
              onChange={(e) => update('cvv', e.target.value)}
              error={errors.cvv}
              numeric
              inputMode="numeric"
              autoComplete="cc-csc"
              type="password"
            />
          </div>
        </div>
      </div>

      {/* Provider note */}
      <p className="text-center text-xs text-gray-400">
        {t
          ? 'החיוב יבוצע לאחר חיבור ספק הסליקה · ניתן לבטל בכל עת'
          : 'Charge will be made after connecting payment provider · Cancel anytime'}
      </p>
    </div>
  )
}
