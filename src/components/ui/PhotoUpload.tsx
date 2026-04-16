'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  value: string[]
  onChange: (photos: string[]) => void
  max?: number
  locale?: string
}

export function PhotoUpload({ value, onChange, max = 5, locale = 'he' }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const t = locale === 'he'

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = max - value.length
    const toAdd = Array.from(files).slice(0, remaining)
    toAdd.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange([...value, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150',
          dragging
            ? 'border-navy-400 bg-navy-50'
            : 'border-gray-300 hover:border-navy-300 hover:bg-gray-50',
          value.length >= max && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <svg className="w-10 h-10 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="font-medium text-sm text-navy-600">
              {t ? 'העלה תמונות שידוכים' : 'Upload matchmaking photos'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t
                ? `לחץ לבחירה או גרור לכאן (עד ${max} תמונות)`
                : `Click to select or drag here (up to ${max} photos)`}
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {value.length}/{max} {t ? 'תמונות' : 'photos'}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 start-1 bg-navy-500 text-white text-xs px-1.5 py-0.5 rounded">
                  {t ? 'ראשית' : 'Main'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
