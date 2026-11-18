'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shows photos at full size over the page. Arrows (or the keyboard, or a swipe) move between the
 * photos; Escape, the close button or a click outside closes it.
 */
export function PhotoViewer({
  photos, start = 0, onClose,
}: { photos: string[]; start?: number; onClose: () => void }) {
  const [i, setI] = useState(Math.min(Math.max(start, 0), Math.max(photos.length - 1, 0)))
  const touchX = useRef<number | null>(null)
  const count = photos.length

  const go = useCallback((d: number) => setI((n) => (count === 0 ? 0 : (n + d + count) % count)), [count])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [go, onClose])

  if (count === 0) return null

  return (
    <div
      dir="ltr"
      role="dialog" aria-modal="true" aria-label="תמונה מוגדלת"
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      {/* Signed URL from private storage, so next/image is not used. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[i]} alt=""
        className="max-h-[88vh] max-w-[96vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button" onClick={(e) => { e.stopPropagation(); onClose() }} aria-label="סגירה"
        className="absolute top-4 end-4 w-11 h-11 rounded-full bg-white/90 text-navy-800 text-2xl leading-none font-bold flex items-center justify-center"
      >
        ×
      </button>
      {count > 1 && (
        <>
          <button
            type="button" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="התמונה הקודמת"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-navy-800 text-3xl leading-none flex items-center justify-center"
          >
            ‹
          </button>
          <button
            type="button" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="התמונה הבאה"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-navy-800 text-3xl leading-none flex items-center justify-center"
          >
            ›
          </button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 text-white text-sm px-4 py-1.5 tabular-nums">
            {i + 1} / {count}
          </span>
        </>
      )}
    </div>
  )
}
