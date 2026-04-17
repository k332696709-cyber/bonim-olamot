'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import { FEMALE_STYLE_OPTIONS, FEMALE_PARTNER_STYLE_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'
import { getT } from '@/lib/i18n/translations'

export function FemaleStyleSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const T = getT(locale)

  return (
    <FormSection title={T.sections.style}>
      <div className="flex flex-col gap-6">
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.styleQuestionFemale} <span className="text-burgundy-500">*</span></label>
          <Controller name="style" control={control} render={({ field }) => (
            <RadioGroup name="style" options={FEMALE_STYLE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.style?.message} locale={locale} />
          )} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.partnerStyleQuestionFemale} <span className="text-burgundy-500">*</span></label>
          <Controller name="partnerStyle" control={control} render={({ field }) => (
            <RadioGroup name="partnerStyle" options={FEMALE_PARTNER_STYLE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerStyle?.message} locale={locale} />
          )} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.preferredStream}</label>
          <Textarea id="preferredStream" placeholder={T.sections.preferredStreamPlaceholderFemale} rows={2} {...register('preferredStream')} />
        </div>
      </div>
    </FormSection>
  )
}
