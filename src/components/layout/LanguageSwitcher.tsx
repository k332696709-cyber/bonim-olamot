'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: string
}

// The site is in Hebrew; other languages are an accessibility option. More can be added to this list.
const LANGUAGES = [
  { code: 'he', name: 'עברית' },
  { code: 'en', name: 'English' },
]

/** A globe button that opens a short list of languages. */
export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pathFor = (code: string) => pathname.replace(`/${locale}`, `/${code}`) || `/${code}`

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open}
        aria-label="שפה / Language"
        className="w-10 h-10 rounded-full border border-navy-200 text-navy-600 hover:bg-navy-50 shadow-sm flex items-center justify-center"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 mt-2 min-w-[9rem] rounded-2xl bg-white shadow-luxury border border-navy-100 py-1.5 z-50">
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === locale}>
              <Link
                href={pathFor(l.code)}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-navy-50',
                  l.code === locale ? 'font-bold text-navy-800' : 'text-navy-600',
                )}
              >
                {l.name}
                {l.code === locale && <span aria-hidden>✓</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
