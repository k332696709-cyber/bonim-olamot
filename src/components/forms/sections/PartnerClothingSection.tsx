'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { FEMALE_PARTNER_CLOTHING_OPTIONS as PARTNER_CLOTHING_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function PartnerClothingSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'לבוש בן הזוג הרצוי' : 'Desired Partner Clothing'}>
      <Label
        he="מהו סגנון הלבוש המועדף על בן הזוג?"
        en="What clothing style do you prefer in a partner?"
        required
      />
      <Controller
        name="partnerClothing"
        control={control}
        render={({ field }) => (
          <RadioGroup
            name="partnerClothing"
            options={PARTNER_CLOTHING_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.partnerClothing?.message}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
