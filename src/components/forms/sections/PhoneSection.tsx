'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { PHONE_TYPE_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function PhoneSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'סוג טלפון' : 'Phone Type'}>
      <Label
        he="איזה סוג טלפון ברשותך?"
        en="What type of phone do you have?"
        required
      />
      <Controller
        name="phoneType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name="phoneType"
            options={PHONE_TYPE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.phoneType?.message}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
