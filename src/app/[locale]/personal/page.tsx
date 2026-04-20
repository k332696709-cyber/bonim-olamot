import { PersonalAreaClient } from '@/components/personal/PersonalAreaClient'

export default function PersonalPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return <PersonalAreaClient locale={locale} />
}
