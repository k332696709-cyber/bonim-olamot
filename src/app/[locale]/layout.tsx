import type { Metadata } from 'next'
import '../globals.css'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'בונים עולמות – שידוכים',
  description: 'פלטפורמת שידוכים בדרך האמת',
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const dir = locale === 'he' ? 'rtl' : 'ltr'
  return (
    <html lang={locale} dir={dir}>
      <body>
        <Header locale={locale} />
        {children}
      </body>
    </html>
  )
}
