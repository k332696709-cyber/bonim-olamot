'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { FEMALE_STYLE_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function StyleSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'סגנון' : 'Style'}>
      <Label
        he="מהו הסגנון שמגדיר אותך?"
        en="How would you define your style?"
        required
      />
      <Controller
        name="style"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name="style"
            options={FEMALE_STYLE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.style?.message}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
