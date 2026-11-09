import { SmartMatchClient } from '@/components/smart-match/SmartMatchClient'

export default function SmartMatchPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="hero-dark text-white text-center px-4 py-16 sm:py-24 mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-2 text-sm text-burgundy-100 mb-6">
          <span className="w-2 h-2 rounded-full bg-burgundy-300" />
          {isHe ? 'בינה מלאכותית · דיסקרטי' : 'AI-assisted · confidential'}
        </span>
        <h1 className="leading-[1.1] mb-4">
          <span className="block text-3xl sm:text-5xl font-light">{isHe ? 'ההצעות מגיעות אליך,' : 'Suggestions come to you,'}</span>
          <span className="block text-4xl sm:text-6xl font-bold text-burgundy-300">{isHe ? 'חכם ובנחת.' : 'smart and calm.'}</span>
        </h1>
        <p className="text-navy-100 text-base sm:text-lg max-w-2xl mx-auto">
          {isHe
            ? 'המערכת מדרגת הצעות לפי התאמה, והעוזר החכם מדייק אותן לפי מה שחשוב לך. כשיש עניין הדדי, שדכנית נכנסת לתמונה.'
            : 'The system ranks suggestions by compatibility and the smart assistant refines them to what matters to you. When interest is mutual, a matchmaker steps in.'}
        </p>
      </div>
      <SmartMatchClient locale={locale} />
    </div>
  )
}
