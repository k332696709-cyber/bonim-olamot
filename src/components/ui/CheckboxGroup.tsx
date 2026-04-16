'use client'

import { cn } from '@/lib/utils'
import type { Option } from '@/constants/formOptions'

interface CheckboxGroupProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  max?: number
  error?: string
  locale?: string
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  max = 3,
  error,
  locale = 'he',
}: CheckboxGroupProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else if (value.length < max) {
      onChange([...value, optValue])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value.includes(opt.value)
          const isDisabled = !isSelected && value.length >= max
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={isDisabled}
              className={cn(
                'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 select-none',
                isSelected
                  ? 'bg-navy-500 border-navy-500 text-white shadow-sm'
                  : isDisabled
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:border-navy-400 hover:text-navy-600 bg-white',
              )}
            >
              {locale === 'he' ? opt.he : opt.en}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            'text-xs',
            value.length === 0 ? 'text-gray-400' : value.length < 2 ? 'text-amber-500' : 'text-green-600',
          )}
        >
          {locale === 'he'
            ? `נבחרו ${value.length} מתוך ${max}`
            : `${value.length} of ${max} selected`}
        </span>
        {value.length < 2 && (
          <span className="text-xs text-gray-400">
            {locale === 'he' ? `בחרי לפחות 2` : 'Select at least 2'}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-burgundy-500 text-start">{error}</p>
      )}
    </div>
  )
}
