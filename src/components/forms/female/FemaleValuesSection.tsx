'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import {
  TRAIT_OPTIONS_FEMALE, RELATIONSHIP_VALUES_FEMALE, BRINGS_FEMALE,
  FLEXIBILITY_OPTIONS, FEMALE_CLOTHING_OPTIONS, HEADCOVERING_OPTIONS,
  FEMALE_PARTNER_CLOTHING_OPTIONS, PHONE_TYPE_OPTIONS,
} from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'
import { getT } from '@/lib/i18n/translations'

export function FemaleValuesSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const T = getT(locale)

  return (
    <div className="flex flex-col gap-6">

      <FormSection title={T.sections.traits} subtitle={T.sections.traitsSubtitleFemale}>
        <Controller name="traits" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={TRAIT_OPTIONS_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.traits?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.values} subtitle={T.sections.valuesSubtitle}>
        <Controller name="relationshipValues" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={RELATIONSHIP_VALUES_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.relationshipValues?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.bringsFemale} subtitle={T.sections.bringsSubtitleFemale}>
        <Controller name="brings" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={BRINGS_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.brings?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.doesntSuit}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.doesntSuitLabel}</label>
        <Textarea id="doesntSuit" placeholder={T.placeholders.doesntSuit} rows={3} {...register('doesntSuit')} />
      </FormSection>

      <FormSection title={T.sections.flexibility}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.flexibilityQuestion} <span className="text-burgundy-500">*</span></label>
        <Controller name="flexibility" control={control} render={({ field }) => (
          <RadioGroup name="flexibility" options={FLEXIBILITY_OPTIONS} value={field.value} onChange={field.onChange} error={errors.flexibility?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.clothing}>
        <Controller name="clothing" control={control} render={({ field }) => (
          <RadioGroup name="clothing" options={FEMALE_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.clothing?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.headcovering} subtitle={locale === 'he' ? 'ניתן לבחור עד 2 אפשרויות' : 'Select up to 2'}>
        <Controller name="headcovering" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={HEADCOVERING_OPTIONS} value={field.value as string[]} onChange={field.onChange} max={2} min={1} error={errors.headcovering?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.partnerClothingFemale}>
        <Controller name="partnerClothing" control={control} render={({ field }) => (
          <RadioGroup name="partnerClothing" options={FEMALE_PARTNER_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerClothing?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.phoneSection}>
        <Controller name="phoneType" control={control} render={({ field }) => (
          <RadioGroup name="phoneType" options={PHONE_TYPE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.phoneType?.message} locale={locale} />
        )} />
      </FormSection>

      <FormSection title={T.sections.aboutYouFemale}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.aboutYouLabelFemale}</label>
        <Textarea id="aboutMe" placeholder={T.placeholders.aboutMe} rows={4} {...register('aboutMe')} />
      </FormSection>

      <FormSection title={T.sections.aboutPartnerFemale}>
        <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.sections.aboutPartnerLabelFemale}</label>
        <Textarea id="aboutPartner" placeholder={T.placeholders.aboutPartner} rows={4} {...register('aboutPartner')} />
      </FormSection>
    </div>
  )
}
