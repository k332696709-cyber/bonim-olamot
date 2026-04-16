'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { CheckboxGroup } from '@/components/ui/CheckboxGroup'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { FormSection } from '@/components/ui/FormSection'
import { Textarea } from '@/components/ui/Textarea'
import {
  RELATIONSHIP_VALUES_MALE, BRINGS_MALE,
  FLEXIBILITY_OPTIONS, MALE_CLOTHING_OPTIONS, MALE_PARTNER_CLOTHING_OPTIONS, PHONE_TYPE_OPTIONS,
} from '@/constants/formOptions'
import type { MaleRegistrationData } from '@/lib/validations/maleRegistration'

export function MaleValuesSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<MaleRegistrationData>()
  const t = locale === 'he'

  return (
    <div className="flex flex-col gap-6">

      {/* Section 4 */}
      <FormSection title={t ? '4. מה הכי חשוב לך בזוגיות?' : '4. Most Important in a Relationship'} subtitle={t ? 'בחר 2–3' : 'Select 2–3'}>
        <Controller name="relationshipValues" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={RELATIONSHIP_VALUES_MALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.relationshipValues?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      {/* Section 5 */}
      <FormSection title={t ? '5. מה אתה מביא לנישואים?' : '5. What Do You Bring to Marriage?'} subtitle={t ? 'בחר 2–3' : 'Select 2–3'}>
        <Controller name="brings" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={BRINGS_MALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.brings?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      {/* Section 6 */}
      <FormSection title={t ? '6. מה לא מתאים לך?' : '6. What Doesn\'t Suit You?'}>
        <Label he='נקודות קצרות (לדוג׳: "מודרני מדי", "פער גדול בסגנון")' en='Short notes (e.g. "too modern", "big style gap")' htmlFor="doesntSuit" />
        <Textarea id="doesntSuit" placeholder={t ? 'כתוב כאן...' : 'Write here...'} rows={3} {...register('doesntSuit')} />
      </FormSection>

      {/* Section 7 */}
      <FormSection title={t ? '7. גמישות' : '7. Flexibility'}>
        <Label he="עד כמה חשוב לך שהצד השני יהיה דומה לך בסגנון?" en="How important is it that your partner matches your style?" required />
        <Controller name="flexibility" control={control} render={({ field }) => (
          <RadioGroup name="flexibility" options={FLEXIBILITY_OPTIONS} value={field.value} onChange={field.onChange} error={errors.flexibility?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 8 */}
      <FormSection title={t ? '8. סגנון לבוש שלך' : '8. Your Clothing Style'}>
        <Controller name="clothing" control={control} render={({ field }) => (
          <RadioGroup name="clothing" options={MALE_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.clothing?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 9 */}
      <FormSection title={t ? '9. סגנון לבוש של הבחורה שאתה רוצה' : '9. Desired Partner Clothing'}>
        <Controller name="partnerClothing" control={control} render={({ field }) => (
          <RadioGroup name="partnerClothing" options={MALE_PARTNER_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerClothing?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Phone */}
      <FormSection title={t ? 'נייד שלך' : 'Your Phone'}>
        <Controller name="phoneType" control={control} render={({ field }) => (
          <RadioGroup name="phoneType" options={PHONE_TYPE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.phoneType?.message} locale={locale} />
        )} />
      </FormSection>

      {/* About */}
      <FormSection title={t ? 'קצת עליך' : 'About You'}>
        <Label he="אנא כתוב בקצרה על עצמך (מי אתה וכו')" en="Write briefly about yourself" htmlFor="aboutMe" />
        <Textarea id="aboutMe" placeholder={t ? 'מי אתה, מה מאפיין אותך...' : 'Who you are...'} rows={4} {...register('aboutMe')} />
      </FormSection>

      <FormSection title={t ? 'בת הזוג שאתה מחפש' : 'The Partner You\'re Looking For'}>
        <Label he="אנא כתוב בקצרה על בת הזוג שאתה מחפש" en="Write briefly about the partner you're looking for" htmlFor="aboutPartner" />
        <Textarea id="aboutPartner" placeholder={t ? 'תיאור קצר...' : 'Brief description...'} rows={4} {...register('aboutPartner')} />
      </FormSection>

    </div>
  )
}
