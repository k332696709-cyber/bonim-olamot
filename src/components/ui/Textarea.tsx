'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white resize-none',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-400',
          'focus:border-navy-400 hover:border-navy-300 transition-colors duration-150',
          error ? 'border-burgundy-400' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-burgundy-500 text-start">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
