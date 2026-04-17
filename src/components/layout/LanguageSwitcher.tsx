'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const hePath = pathname.replace(`/${locale}`, '/he') || '/he'
  const enPath = pathname.replace(`/${locale}`, '/en') || '/en'
  const isHe = locale === 'he'

  return (
    <div
      className="inline-flex items-center rounded-full border border-navy-200 overflow-hidden text-xs font-semibold shadow-sm"
      role="group"
      aria-label="בחר שפה / Choose language"
    >
      <Link
        href={hePath}
        aria-current={isHe ? 'true' : undefined}
        className={cn(
          'px-3.5 py-1.5 transition-colors duration-150 select-none',
          isHe
            ? 'bg-navy-600 text-white'
            : 'text-navy-500 hover:bg-navy-50',
        )}
      >
        עברית
      </Link>
      <span className="w-px h-4 bg-navy-200 shrink-0" />
      <Link
        href={enPath}
        aria-current={!isHe ? 'true' : undefined}
        className={cn(
          'px-3.5 py-1.5 transition-colors duration-150 select-none',
          !isHe
            ? 'bg-navy-600 text-white'
            : 'text-navy-500 hover:bg-navy-50',
        )}
      >
        English
      </Link>
    </div>
  )
}
