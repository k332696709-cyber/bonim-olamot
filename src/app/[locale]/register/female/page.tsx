import { FemaleRegistrationForm } from '@/components/forms/FemaleRegistrationForm'

interface PageProps {
  params: { locale: string }
}

export default function FemaleRegisterPage({ params: { locale } }: PageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <FemaleRegistrationForm locale={locale} />
    </div>
  )
}
