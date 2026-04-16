'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { HEADCOVERING_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function HeadcoveringSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'כיסוי ראש לאחר נישואין' : 'Head Covering After Marriage'}>
      <Label
        he="מה כיסוי הראש הרצוי לאחר הנישואין?"
        en="What head covering do you intend to wear after marriage?"
        required
      />
      <Controller
        name="headcovering"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name="headcovering"
            options={HEADCOVERING_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.headcovering?.message}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
