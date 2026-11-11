import { PageHero } from '@/components/layout/PageHero'
import { FemaleRegistrationForm } from '@/components/forms/FemaleRegistrationForm'

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div>
      <PageHero
        badge="הרשמה"
        chips={['עד 5 תמונות', 'פרופיל מיידי', 'העוזר החכם', 'שדכנים מלווים']}
        title={"שאלון הכרות 'בונים עולמות' מיועדות"}
        subtitle="ממלאים פעם אחת, והשדכנים והעוזר החכם עושים את השאר."
      />
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative">
        <FemaleRegistrationForm locale={locale} />
      </div>
    </div>
  )
}
