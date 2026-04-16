'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { Option } from '@/constants/formOptions'

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  placeholder?: string
  error?: string
  locale?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ options, placeholder, error, locale = 'he', className, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400',
            'transition-colors duration-150 cursor-pointer',
            error
              ? 'border-burgundy-400 focus:ring-burgundy-300'
              : 'border-gray-300 hover:border-navy-300',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {locale === 'he' ? opt.he : opt.en}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-burgundy-500 text-start">{error}</p>
        )}
      </div>
    )
  }
)

SelectField.displayName = 'SelectField'
