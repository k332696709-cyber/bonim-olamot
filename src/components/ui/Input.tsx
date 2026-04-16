'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  numeric?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, numeric, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          dir={numeric ? 'ltr' : undefined}
          className={cn(
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900',
            'placeholder:text-gray-400 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400',
            'transition-colors duration-150',
            error
              ? 'border-burgundy-400 focus:ring-burgundy-300'
              : 'border-gray-300 hover:border-navy-300',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-burgundy-500 text-start">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
