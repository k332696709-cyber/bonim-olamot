'use client'

import Link from 'next/link'

/** "Smart Assistant" link, shown to everyone; the page itself asks visitors to sign in and finish the questionnaire. */
export function SmartNavLink({
  locale, className, onClick, children,
}: { locale: string; className?: string; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <Link href={`/${locale}/smart-match`} className={className} onClick={onClick}>
      {children ?? (locale === 'he' ? 'עוזר חכם' : 'Smart Assistant')}
    </Link>
  )
}
