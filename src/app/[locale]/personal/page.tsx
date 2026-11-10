import { CandidateArea } from '@/components/personal/CandidateArea'

export default function PersonalPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return <CandidateArea locale={locale} />
}
