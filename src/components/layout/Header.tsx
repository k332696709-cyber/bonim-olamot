import Link from 'next/link'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'
import { getT } from '@/lib/i18n/translations'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  const T = getT(locale)
  const isHe = locale === 'he'

  const navLinks = [
    { href: `/${locale}`,          label: isHe ? 'דף הבית'   : 'Home' },
    { href: `/${locale}/personal`, label: isHe ? 'אזור אישי' : 'Personal Area' },
    { href: `/${locale}/contact`,  label: isHe ? 'צור קשר'   : 'Contact Us' },
    { href: `/${locale}/about`,    label: isHe ? 'אודות'      : 'About Us' },
    { href: `/${locale}/terms`,    label: isHe ? 'תקנון'      : 'Terms of Use' },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium text-gray-600',
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

          {/* Matchmaker login — desktop only */}
          <Link
            href={`/${locale}/login`}
            className="hidden md:flex px-4 py-2 rounded-lg bg-navy-500 text-white
              text-sm font-semibold hover:bg-navy-600 transition-colors duration-150"
          >
            {T.nav.login}
          </Link>

          {/* Hamburger — mobile only (rendered by MobileNav client component) */}
          <MobileNav locale={locale} />
        </div>

      </div>
    </header>
  )
}
