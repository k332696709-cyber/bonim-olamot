'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
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

export function FemaleValuesSection({ locale }: { locale: string }) {
  const { control, register, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const t = locale === 'he'

  return (
    <div className="flex flex-col gap-6">

      {/* Section 3 */}
      <FormSection title={t ? '3. מאפייני אופי' : '3. Character Traits'} subtitle={t ? 'סמני 2–3 שמאפיינים אותך במיוחד' : 'Select 2–3 traits'}>
        <Controller name="traits" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={TRAIT_OPTIONS_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.traits?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      {/* Section 4 */}
      <FormSection title={t ? '4. מה הכי חשוב לך בזוגיות?' : '4. Most Important in a Relationship'} subtitle={t ? 'בחרי 2–3' : 'Select 2–3'}>
        <Controller name="relationshipValues" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={RELATIONSHIP_VALUES_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.relationshipValues?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      {/* Section 5 */}
      <FormSection title={t ? '5. מה את מביאה לנישואים?' : '5. What Do You Bring to Marriage?'} subtitle={t ? 'בחרי 2–3' : 'Select 2–3'}>
        <Controller name="brings" control={control} defaultValue={[]} render={({ field }) => (
          <CheckboxGroup options={BRINGS_FEMALE} value={field.value as string[]} onChange={field.onChange} max={3} error={errors.brings?.message as string | undefined} locale={locale} />
        )} />
      </FormSection>

      {/* Section 6 */}
      <FormSection title={t ? '6. מה לא מתאים לך?' : '6. What Doesn\'t Suit You?'}>
        <Label he='נקודות קצרות (לדוג׳: "מודרני מדי", "פער גדול בסגנון")' en='Short notes' htmlFor="doesntSuit" />
        <Textarea id="doesntSuit" placeholder={t ? 'כתבי כאן...' : 'Write here...'} rows={3} {...register('doesntSuit')} />
      </FormSection>

      {/* Section 7 */}
      <FormSection title={t ? '7. גמישות' : '7. Flexibility'}>
        <Label he="עד כמה חשוב לך שהצד השני יהיה דומה לך בסגנון?" en="How important is style similarity?" required />
        <Controller name="flexibility" control={control} render={({ field }) => (
          <RadioGroup name="flexibility" options={FLEXIBILITY_OPTIONS} value={field.value} onChange={field.onChange} error={errors.flexibility?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 8 */}
      <FormSection title={t ? '8. סגנון לבוש שלך' : '8. Your Clothing Style'}>
        <Controller name="clothing" control={control} render={({ field }) => (
          <RadioGroup name="clothing" options={FEMALE_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.clothing?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 9 */}
      <FormSection title={t ? '9. כיסוי ראש לאחר נישואים' : '9. Head Covering After Marriage'}>
        <Controller name="headcovering" control={control} render={({ field }) => (
          <RadioGroup name="headcovering" options={HEADCOVERING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.headcovering?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 10 */}
      <FormSection title={t ? '10. סגנון לבוש של הבחור שאת רוצה' : '10. Desired Partner Clothing'}>
        <Controller name="partnerClothing" control={control} render={({ field }) => (
          <RadioGroup name="partnerClothing" options={FEMALE_PARTNER_CLOTHING_OPTIONS} value={field.value} onChange={field.onChange} error={errors.partnerClothing?.message} locale={locale} />
        )} />
      </FormSection>

      {/* Section 11 */}
      <FormSection title={t ? '11. נייד שלך' : '11. Your Phone'}>
        <Controller name="phoneType" control={control} render={({ field }) => (
          <RadioGroup name="phoneType" options={PHONE_TYPE_OPTIONS} value={field.value} onChange={field.onChange} error={errors.phoneType?.message} locale={locale} />
        )} />
      </FormSection>

      {/* About */}
      <FormSection title={t ? 'קצת עלייך' : 'About You'}>
        <Label he="אנא כתבי עליך בקצרה" en="Write briefly about yourself" htmlFor="aboutMe" />
        <Textarea id="aboutMe" placeholder={t ? 'מי את, מה מאפיין אותך...' : 'Who you are...'} rows={4} {...register('aboutMe')} />
      </FormSection>

      <FormSection title={t ? 'בן הזוג שאת מחפשת' : 'The Partner You\'re Looking For'}>
        <Label he="אנא כתבי בקצרה איזה בן זוג את מחפשת" en="Write briefly about the partner you're looking for" htmlFor="aboutPartner" />
        <Textarea id="aboutPartner" placeholder={t ? 'תיאור קצר...' : 'Brief description...'} rows={4} {...register('aboutPartner')} />
      </FormSection>
    </div>
  )
}
