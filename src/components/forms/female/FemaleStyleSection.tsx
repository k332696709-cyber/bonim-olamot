'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import { FEMALE_STYLE_OPTIONS, FEMALE_PARTNER_STYLE_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

export function FemaleStyleSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? '1. סגנון ואורח חיים' : '1. Style & Lifestyle'}>
      <div className="flex flex-col gap-6">
        <div>
          <Label he="איך היית מגדירה את הסגנון שלך?" en="How would you define your style?" required />
          <Controller name="style" control={control} render={({ field }) => (
            <RadioGroup name="style" options={FEMALE_STYLE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.style?.message} locale={locale} />
          )} />
        </div>
        <div>
          <Label he="איזה סגנון את מחפשת בבן הזוג?" en="What style are you looking for?" required />
          <Controller name="partnerStyle" control={control} render={({ field }) => (
            <RadioGroup name="partnerStyle" options={FEMALE_PARTNER_STYLE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerStyle?.message} locale={locale} />
          )} />
        </div>
        <div>
          <Label he="חסידות / זרם מועדף (אם יש)" en="Preferred Hasidic stream (if any)" htmlFor="preferredStream" />
          <Textarea id="preferredStream" placeholder={t ? 'כתבי אם יש העדפה...' : 'Write if applicable...'} rows={2} {...register('preferredStream')} />
        </div>
      </div>
    </FormSection>
  )
}
