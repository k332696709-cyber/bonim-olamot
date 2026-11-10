import { PageHero } from '@/components/layout/PageHero'
import { MatchmakerRegistrationForm } from '@/components/forms/MatchmakerRegistrationForm'

export default function MatchmakerRegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  return (
    <div>
      <PageHero
        badge={he ? 'לשדכנים' : 'For matchmakers'}
        title={he ? 'הרשמת שדכן/שדכנית' : 'Matchmaker registration'}
        subtitle={he ? 'הצטרפו לרשת השדכנים של בונים עולמות. המנהל מאשר כל בקשה.' : 'Join the Bonim Olamot network. The administrator approves every request.'}
      />
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative">
        <MatchmakerRegistrationForm locale={locale} />
      </div>
    </div>
  )
}
