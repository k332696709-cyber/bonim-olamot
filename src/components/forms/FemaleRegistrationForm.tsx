import { FEMALE_FORM } from '@/constants/registrationForms'
import { TallyRegistrationForm } from './TallyRegistrationForm'

/** Female registration: one-to-one copy of the Tally questionnaire. */
export function FemaleRegistrationForm({ locale: _locale }: { locale: string }) {
  return <TallyRegistrationForm form={FEMALE_FORM} endpoint="/api/register/female" />
}
