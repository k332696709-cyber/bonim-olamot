'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import {
  RELATIONSHIP_VALUES_MALE, BRINGS_MALE,
  FLEXIBILITY_OPTIONS, MALE_CLOTHING_OPTIONS, MALE_PARTNER_CLOTHING_OPTIONS, PHONE_TYPE_OPTIONS,
} from '@/constants/formOptions'
import type { MaleRegistrationData } from '@/lib/validations/maleRegistration'
import { getT } from '@/lib/i18n/translations'

export function MaleValuesSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<MaleRegistrationData>()
  const T = getT(locale)

  return (
    <div className="flex flex-col gap-6">

      <FormSection title={T.sections.values} subtitle={T.sections.valuesMaleSubtitle}>
        <Controller name="relationshipValues" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={RELATIONSHIP_VALUES_MALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.relationshipValues?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.bringsMale} subtitle={T.sections.bringsSubtitleMale}>
        <Controller name="brings" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={BRINGS_MALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.brings?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.doesntSuit}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.doesntSuitLabel}</label>
        <Textarea id="doesntSuit" placeholder={T.placeholders.doesntSuitMale} rows={3} {...register('doesntSuit')} />
      </FormSection>

      <FormSection title={T.sections.flexibility}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.flexibilityQuestion} <span className="text-burgundy-500">*</span></label>
        <Controller name="flexibility" control={control} render={({ field }) => (
          <RadioGroup name="flexibility" options={FLEXIBILITY_OPTIONS} value={field.value} onChange={field.onChange} error={errors.flexibility?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.clothing}>
        <Controller name="clothing" control={control} render={({ field }) => (
          <RadioGroup name="clothing" options={MALE_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.clothing?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.partnerClothingMale}>
        <Controller name="partnerClothing" control={control} render={({ field }) => (
          <RadioGroup name="partnerClothing" options={MALE_PARTNER_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerClothing?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.phoneSectionMale}>
        <Controller name="phoneType" control={control} render={({ field }) => (
          <RadioGroup name="phoneType" options={PHONE_TYPE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.phoneType?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.aboutYouMale}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.aboutYouLabelMale}</label>
        <Textarea id="aboutMe" placeholder={T.placeholders.aboutMeMale} rows={4} {...register('aboutMe')} />
      </FormSection>

      <FormSection title={T.sections.aboutPartnerMale}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.aboutPartnerLabelMale}</label>
        <Textarea id="aboutPartner" placeholder={T.placeholders.aboutPartner} rows={4} {...register('aboutPartner')} />
      </FormSection>

    </div>
  )
}
