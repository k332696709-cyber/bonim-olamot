import Link from 'next/link'
import { ContactForm } from './ContactForm'

const WHATSAPP_NUMBER = '972501234567' // replace with real number
const PHONE_NUMBER    = '+972-50-123-4567'
const EMAIL_ADDRESS   = 'info@bonim-olamot.co.il'

interface ContactCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  href: string
  label: string
  color: string
}

function ContactCard({ icon, title, subtitle, href, label, color }: ContactCardProps) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group flex flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100
        shadow-sm p-7 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-bold text-navy-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy-600 text-white
        text-sm font-semibold group-hover:bg-navy-700 transition-colors duration-150">
        {label}
      </span>
    </a>
  )
}

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'

  const cards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.858L.057 23.536a.5.5 0 0 0 .612.612l5.806-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.032-1.384l-.36-.214-3.742.943.979-3.638-.236-.374A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
      ),
      title:    isHe ? 'וואטסאפ'               : 'WhatsApp',
      subtitle: isHe ? 'זמינים בין 09:00–21:00' : 'Available 09:00–21:00',
      href:     `https://wa.me/${WHATSAPP_NUMBER}`,
      label:    isHe ? 'שלחו לנו הודעה בוואטסאפ' : 'Message us on WhatsApp',
      color:    'bg-green-500',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden="true">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
      title:    isHe ? 'טלפון'              : 'Phone',
      subtitle: PHONE_NUMBER,
      href:     `tel:${PHONE_NUMBER.replace(/[^+\d]/g, '')}`,
      label:    isHe ? 'התקשרו אלינו' : 'Call Us',
      color:    'bg-navy-600',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden="true">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      title:    isHe ? 'אימייל'           : 'Email',
      subtitle: EMAIL_ADDRESS,
      href:     `mailto:${EMAIL_ADDRESS}`,
      label:    isHe ? 'שלחו לנו אימייל' : 'Send us an Email',
      color:    'bg-burgundy-500',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-navy-800 to-navy-950 text-white text-center px-4 py-16 sm:py-20">
        <div className="text-5xl mb-5">💬</div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-4 leading-tight">
          {isHe ? 'אנחנו כאן בשבילך' : 'We Are Here for You'}
        </h1>
        <p className="text-navy-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          {isHe
            ? 'יש לך שאלה, בקשה או רצון ליצור קשר? נשמח לשמוע ממך — בכל אמצעי שנוח לך.'
            : 'Have a question, request, or just want to reach out? We\'d love to hear from you — in whatever way works best.'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-14">

        {/* ── Contact Cards ──────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-navy-800 mb-7 text-center">
            {isHe ? 'בחרו את דרך יצירת הקשר המועדפת' : 'Choose Your Preferred Contact Method'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {cards.map((card) => (
              <ContactCard key={card.href} {...card} />
            ))}
          </div>
        </section>

        {/* ── Contact Form ───────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-navy-800 mb-2">
            {isHe ? 'השאירו פרטים' : 'Leave a Message'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isHe
              ? 'מלאו את הטופס ונחזור אליכם בהקדם האפשרי.'
              : 'Fill in the form and we\'ll get back to you as soon as possible.'}
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <ContactForm locale={locale} />
          </div>
        </section>

      </div>

      {/* ── Back link ─────────────────────────────────────────────── */}
      <div className="text-center pb-12">
        <Link href={`/${locale}`}
          className="text-sm text-gray-400 hover:text-navy-500 transition-colors">
          {isHe ? '← חזרה לדף הבית' : '← Back to home'}
        </Link>
      </div>
    </div>
  )
}
