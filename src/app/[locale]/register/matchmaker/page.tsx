import { MatchmakerRegistrationForm } from '@/components/forms/MatchmakerRegistrationForm'

export default function MatchmakerRegisterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <MatchmakerRegistrationForm locale={locale} />
    </div>
  )
}
