'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { FormSection } from '@/components/ui/FormSection'
import { TRAIT_OPTIONS_MALE } from '@/constants/formOptions'
import type { MaleRegistrationData } from '@/lib/validations/maleRegistration'

export function MaleTraitsSection({ locale }: { locale: string }) {
  const { control, formState: { errors } } = useFormContext<MaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? '3. מאפייני אופי' : '3. Character Traits'} subtitle={t ? 'סמן 2–3 שמאפיינים אותך במיוחד' : 'Select 2–3 traits'}>
      <Controller name="traits" control={control} defaultValue={[]} render={({ field }) => (
        <CheckboxGroup options={TRAIT_OPTIONS_MALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.traits?.message as string | undefined} locale={locale} />
      )} />
    </FormSection>
  )
}
