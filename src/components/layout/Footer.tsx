import Link from 'next/link'
import { getT } from '@/lib/i18n/translations'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const T = getT(locale)
  const isHe = locale === 'he'

  const mainLinks = [
    { href: `/${locale}`,            label: isHe ? 'דף הבית'          : 'Home' },
    { href: `/${locale}/date-spots`, label: isHe ? 'מקומות לדייטים'  : 'Dating Spots' },
    { href: `/${locale}/donations`,  label: isHe ? 'תרומות'           : 'Donations' },
    { href: `/${locale}/about`,      label: isHe ? 'אודות'            : 'About Us' },
    { href: `/${locale}/terms`,      label: isHe ? 'תקנון'            : 'Terms of Service' },
    { href: `/${locale}/contact`,    label: isHe ? 'צור קשר'          : 'Contact Us' },
  ]

  const registerLinks = [
    { href: `/${locale}/register/male`,       label: isHe ? 'הרשמה למיועד'   : 'Register – Male' },
    { href: `/${locale}/register/female`,     label: isHe ? 'הרשמה למיועדת' : 'Register – Female' },
    { href: `/${locale}/register/matchmaker`, label: isHe ? 'פינת השדכן'     : 'Matchmaker Corner' },
  ]

  const linkClass =
    'text-navy-200 text-sm hover:text-white hover:underline underline-offset-2 transition-colors duration-150'

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-6">

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">

          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <span className="font-serif text-2xl font-bold text-white leading-tight">
              {T.brand.name}
            </span>
            <p className="text-navy-300 text-sm leading-relaxed">{T.brand.tagline}</p>
            <p className="text-navy-400 text-xs leading-relaxed">{T.brand.subtitle}</p>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-4">
              {isHe ? 'ניווט' : 'Navigation'}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Registration column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-4">
              {isHe ? 'הרשמה' : 'Registration'}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {registerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Copyright bar ─────────────────────────────────────── */}
        <div className="border-t border-navy-700 pt-5 text-center">
          <p className="text-navy-400 text-xs">
            © 2026 Bonim Olamot.{' '}
            {isHe ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
          </p>
        </div>

      </div>
    </footer>
  )
}
