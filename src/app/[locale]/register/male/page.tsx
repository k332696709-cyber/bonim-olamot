import { MaleRegistrationForm } from '@/components/forms/MaleRegistrationForm'

export default function MaleRegisterPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <MaleRegistrationForm locale={locale} />
    </div>
  )
}
