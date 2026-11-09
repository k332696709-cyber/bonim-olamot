import { MALE_FORM } from '@/constants/registrationForms'
import { TallyRegistrationForm } from './TallyRegistrationForm'

/** Male registration: one-to-one copy of the Tally questionnaire. */
export function MaleRegistrationForm({ locale: _locale }: { locale: string }) {
  return <TallyRegistrationForm form={MALE_FORM} endpoint="/api/register/male" />
}
