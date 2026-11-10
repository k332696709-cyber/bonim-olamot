import { PageHero } from '@/components/layout/PageHero'
import { MaleRegistrationForm } from '@/components/forms/MaleRegistrationForm'

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div>
      <PageHero
        badge="הרשמה"
        title={"שאלון הכרות 'בונים עולמות' מיועדים"}
        subtitle="ממלאים פעם אחת, והשדכנים והעוזר החכם עושים את השאר."
      />
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative">
        <MaleRegistrationForm locale={locale} />
      </div>
    </div>
  )
}
