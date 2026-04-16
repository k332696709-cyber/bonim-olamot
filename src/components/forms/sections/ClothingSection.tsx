'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { FEMALE_CLOTHING_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function ClothingSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'סגנון לבוש' : 'Clothing Style'}>
      <Label
        he="כיצד תגדירי את סגנון הלבוש שלך?"
        en="How would you define your clothing style?"
        required
      />
      <Controller
        name="clothing"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name="clothing"
            options={FEMALE_CLOTHING_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.clothing?.message}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
