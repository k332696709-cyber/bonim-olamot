import type { Metadata } from 'next'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'בונים עולמות – שידוכים',
  description: 'אתר שידוכים לקהילה החרדית',
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
        <Footer locale={locale} />
      </body>
    </html>
  )
}
