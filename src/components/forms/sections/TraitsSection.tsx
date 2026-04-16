'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { FormSection } from '@/components/ui/FormSection'
import { TRAIT_OPTIONS_FEMALE as TRAIT_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function TraitsSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection
      title={t ? 'תכונות אופי' : 'Character Traits'}
      subtitle={t ? 'בחרי 2–3 תכונות המאפיינות אותך' : 'Select 2–3 traits that describe you'}
    >
      <Label
        he="תכונות אופי"
        en="Character Traits"
        required
      />
      <Controller
        name="traits"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <CheckboxGroup
            options={TRAIT_OPTIONS}
            value={field.value as string[]}
            onChange={field.onChange}
            max={3}
            error={errors.traits?.message as string | undefined}
            locale={locale}
          />
        )}
      />
    </FormSection>
  )
}
