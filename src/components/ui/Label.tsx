'use client'

import { cn } from '@/lib/utils'

interface LabelProps {
  he: string
  en?: string
  htmlFor?: string
  required?: boolean
  className?: string
  locale?: string
}

export function Label({ he, en, htmlFor, required, className, locale = 'he' }: LabelProps) {
  const text = locale === 'en' && en ? en : he
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block mb-1.5', className)}
    >
      <span className="font-semibold text-navy-500 text-sm">
        {text}
        {required && <span className="text-burgundy-500 ms-0.5">*</span>}
      </span>
    </label>
  )
}
