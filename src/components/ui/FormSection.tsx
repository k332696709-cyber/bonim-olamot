'use client'

import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, subtitle, children, className }: FormSectionProps) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden', className)}>
      {/* Section Header */}
      <div className="bg-gradient-to-l from-navy-500 to-navy-600 px-6 py-4">
        <h2 className="text-white font-semibold text-base tracking-wide">{title}</h2>
        {subtitle && (
          <p className="text-navy-200 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      {/* Section Body */}
      <div className="p-6">{children}</div>
    </div>
  )
}
