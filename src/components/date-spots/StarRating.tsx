'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Display-only (read) star rating ─────────────────────────────────────────

interface StarDisplayProps {
  rating: number   // 1–5, supports .5 increments
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  reviewCount?: number
}

export function StarDisplay({ rating, size = 'md', showNumber = true, reviewCount }: StarDisplayProps) {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4.5 h-4.5', lg: 'w-6 h-6' }
  const textMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  const sz = sizeMap[size]

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled    = rating >= star
          const halfFill  = !filled && rating >= star - 0.5
          return (
            <span key={star} className="relative inline-block">
              {/* Background (empty) star */}
              <svg className={cn(sz, 'text-gray-200')} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              {/* Filled overlay */}
              {(filled || halfFill) && (
                <svg
                  className={cn(sz, 'text-amber-400 absolute inset-0')}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={halfFill ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              )}
            </span>
          )
        })}
      </div>

      {showNumber && (
        <span className={cn(textMap[size], 'font-semibold text-gray-700 tabular-nums')}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn(textMap[size], 'text-gray-400')}>
          ({reviewCount} ביקורות)
        </span>
      )}
    </div>
  )
}

// ─── Interactive (input) star rating ─────────────────────────────────────────

interface StarInputProps {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}

export function StarInput({ value, onChange, size = 'lg' }: StarInputProps) {
  const [hovered, setHovered] = useState(0)
  const sizeMap = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9' }
  const sz = sizeMap[size]
  const display = hovered || value

  return (
    <div className="flex items-center gap-1" role="group" aria-label="דירוג">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform duration-100 hover:scale-110 focus:outline-none"
          aria-label={`${star} כוכבים`}
        >
          <svg
            className={cn(sz, display >= star ? 'text-amber-400' : 'text-gray-200', 'transition-colors duration-100')}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-gray-500 ms-1">
          {['', 'גרוע', 'בינוני', 'סביר', 'טוב', 'מעולה!'][value]}
        </span>
      )}
    </div>
  )
}
