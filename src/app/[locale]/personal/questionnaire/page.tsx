import { QuestionnaireClient } from '@/components/personal/QuestionnaireClient'

export default function QuestionnairePage({ params: { locale } }: { params: { locale: string } }) {
  return <QuestionnaireClient locale={locale} />
}
