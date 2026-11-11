import { PageHero } from '@/components/layout/PageHero'
import { SmartMatchClient } from '@/components/smart-match/SmartMatchClient'

export default function SmartMatchPage({ params: { locale } }: { params: { locale: string } }) {
  const isHe = locale === 'he'
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f1f1]" dir={isHe ? 'rtl' : 'ltr'}>
      <PageHero
        badge={isHe ? 'בינה מלאכותית · דיסקרטי' : 'AI-assisted · confidential'}
        title={
          <>
            <span className="block text-3xl sm:text-5xl font-light">{isHe ? 'ההצעות מגיעות אליך,' : 'Suggestions come to you,'}</span>
            <span className="block text-4xl sm:text-6xl font-bold text-burgundy-300">{isHe ? 'חכם ובנחת.' : 'smart and calm.'}</span>
          </>
        }
        subtitle={isHe
          ? 'המערכת מדרגת הצעות לפי התאמה, והעוזר החכם מדייק אותן לפי מה שחשוב לך. כשיש עניין הדדי, שדכנית נכנסת לתמונה.'
          : 'The system ranks suggestions by compatibility and the smart assistant refines them to what matters to you. When interest is mutual, a matchmaker steps in.'}
        chips={isHe ? ['התאמה 94%', 'עניין הדדי', 'פרטים אנונימיים', 'הצעה חדשה'] : ['94% match', 'Mutual interest', 'Anonymous details', 'New suggestion']}
        className="mb-10"
      />
      <SmartMatchClient locale={locale} />
    </div>
  )
}
