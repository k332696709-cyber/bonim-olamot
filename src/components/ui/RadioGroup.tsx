'use client'

import { cn } from '@/lib/utils'
import type { Option } from '@/constants/formOptions'

interface RadioGroupProps {
  name: string
  options: Option[]
  value?: string
  onChange: (value: string) => void
  error?: string
  locale?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  locale = 'he',
}: RadioGroupProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer',
                'transition-all duration-150 select-none',
                isSelected
                  ? 'border-navy-400 bg-navy-50 text-navy-700'
                  : 'border-gray-200 bg-white hover:border-navy-200 hover:bg-gray-50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="accent-navy-500 w-4 h-4 shrink-0"
              />
              <span className="text-sm font-medium">
                {locale === 'he' ? opt.he : opt.en}
              </span>
            </label>
          )
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-burgundy-500 text-start">{error}</p>
      )}
    </div>
  )
}
