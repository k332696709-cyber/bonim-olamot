'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()

  // Replace current locale prefix with the other locale
  const targetLocale = locale === 'he' ? 'en' : 'he'
  const targetPath = pathname.replace(`/${locale}`, `/${targetLocale}`)

  return (
    <Link
      href={targetPath}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium',
        'border-navy-200 text-navy-600 hover:bg-navy-50 transition-colors duration-150',
      )}
    >
      <span className="text-base leading-none">{locale === 'he' ? '🇺🇸' : '🇮🇱'}</span>
      <span>{locale === 'he' ? 'English' : 'עברית'}</span>
    </Link>
  )
}
