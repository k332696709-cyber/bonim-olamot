import Link from 'next/link'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const t = locale === 'he'

  const navLinks = [
    { href: `/${locale}`,                    label: t ? 'דף הבית'  : 'Home' },
    { href: `/${locale}/register/female`,    label: t ? 'הרשמה'    : 'Register' },
    { href: `/${locale}/matchmaker`,            label: t ? 'שדכן' : 'Matchmaker' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium text-gray-600',
                'hover:text-navy-600 hover:bg-navy-50 transition-colors duration-150',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/login`}
            className="hidden sm:flex px-4 py-2 rounded-lg bg-navy-500 text-white text-sm font-semibold hover:bg-navy-600 transition-colors duration-150"
          >
            {t ? 'כניסה' : 'Login'}
          </Link>
        </div>

      </div>
    </header>
  )
}
