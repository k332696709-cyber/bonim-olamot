'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { FormSection } from '@/components/ui/FormSection'
import { MARITAL_STATUS_FEMALE } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'
import { getT } from '@/lib/i18n/translations'

export function FemalePersonalSection({ locale }: { locale: string }) {
  const { register, formState: { errors } } = useFormContext<FemaleRegistrationData>()
  const T = getT(locale)

  return (
    <FormSection title={T.sections.personal}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.firstName} <span className="text-burgundy-500">*</span></label>
          <Input id="firstName" placeholder={T.placeholders.firstName} error={errors.firstName?.message} {...register('firstName')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.lastName} <span className="text-burgundy-500">*</span></label>
          <Input id="lastName" placeholder={T.placeholders.lastName} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.age} <span className="text-burgundy-500">*</span></label>
          <Input id="age" type="number" numeric placeholder={T.fields.age} error={errors.age?.message} {...register('age')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.hebrewBirthday} <span className="text-burgundy-500">*</span></label>
          <Input id="hebrewBirthday" placeholder={T.placeholders.hebrewBirthday} error={errors.hebrewBirthday?.message} {...register('hebrewBirthday')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.status} <span className="text-burgundy-500">*</span></label>
          <SelectField id="status" options={MARITAL_STATUS_FEMALE} placeholder={T.placeholders.statusFemale} locale={locale} error={errors.status?.message} defaultValue="" {...register('status')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.community} <span className="text-burgundy-500">*</span></label>
          <Input id="community" placeholder={T.placeholders.community} error={errors.community?.message} {...register('community')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.occupation} <span className="text-burgundy-500">*</span></label>
          <Input id="occupation" placeholder={T.placeholders.occupation} error={errors.occupation?.message} {...register('occupation')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.city} <span className="text-burgundy-500">*</span></label>
          <Input id="city" placeholder={T.placeholders.city} error={errors.city?.message} {...register('city')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.phone} <span className="text-burgundy-500">*</span></label>
          <Input id="phone" type="tel" numeric placeholder="0501234567" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.email} <span className="text-burgundy-500">*</span></label>
          <Input id="email" type="email" numeric placeholder="example@email.com" error={errors.email?.message} {...register('email')} />
        </div>
      </div>
    </FormSection>
  )
}
