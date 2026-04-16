'use client'

import { cn } from '@/lib/utils'

interface LabelProps {
  he: string
  en?: string
  htmlFor?: string
  required?: boolean
  className?: string
}

export function Label({ he, en, htmlFor, required, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block mb-1.5', className)}
    >
      <span className="font-semibold text-navy-500 text-sm">
        {he}
        {required && <span className="text-burgundy-500 ms-0.5">*</span>}
      </span>
      {en && (
        <span className="text-gray-400 text-xs font-normal ms-1.5">
          ({en})
        </span>
      )}
    </label>
  )
}
