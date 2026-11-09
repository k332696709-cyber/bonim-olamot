import Link from 'next/link'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'
import { SmartNavLink } from './SmartNavLink'
import { getT } from '@/lib/i18n/translations'
import { NotificationBell } from './NotificationBell'

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
    // Floating pill header (Shmili style). Sticky wrapper is transparent so the
    // dark hero can slide up behind it on the home page.
    <header className="sticky top-3 z-30 px-3 sm:px-6 pointer-events-none">
      <div
        className="pointer-events-auto max-w-6xl mx-auto h-16 ps-3 pe-2 sm:ps-5 sm:pe-3 flex items-center justify-between gap-1.5 sm:gap-3
          rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,21,41,0.18)] ring-1 ring-navy-900/5"
      >

        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0 block h-12 w-24 overflow-hidden rounded-2xl [&_div]:h-full [&_img]:h-full [&_img]:w-full">
          <Logo size="sm" />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 lg:px-4 py-2 rounded-full text-sm font-medium text-navy-700 whitespace-nowrap',
                'hover:text-white hover:bg-navy-700 transition-colors duration-150',
              )}
            >
              {link.label}
            </Link>
          ))}
          <SmartNavLink
            locale={locale}
            className={cn('px-3 lg:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap text-white bg-burgundy-500 hover:bg-burgundy-600 transition-colors duration-150')}
          />
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell locale={locale} />
          <LanguageSwitcher locale={locale} />

          {/* Matchmaker login — desktop only */}
          <Link
            href={`/${locale}/login`}
            className="hidden md:flex h-11 items-center whitespace-nowrap px-5 lg:px-6 rounded-full bg-burgundy-500 text-white
              text-sm font-bold hover:bg-burgundy-600 transition-colors duration-150"
          >
            {T.nav.login}
          </Link>

          {/* Hamburger — mobile only */}
          <MobileNav locale={locale} />
        </div>

      </div>
    </header>
  )
}
