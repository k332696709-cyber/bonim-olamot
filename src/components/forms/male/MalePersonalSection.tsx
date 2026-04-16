'use client'

import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { FormSection } from '@/components/ui/FormSection'
import { MARITAL_STATUS_MALE } from '@/constants/formOptions'
import type { MaleRegistrationData } from '@/lib/validations/maleRegistration'

export function MalePersonalSection({ locale }: { locale: string }) {
  const { register, formState: { errors } } = useFormContext<MaleRegistrationData>()
  const t = locale === 'he'

  return (
    <FormSection title={t ? 'פרטים אישיים' : 'Personal Information'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label he="שם" en="First Name" htmlFor="firstName" required />
          <Input id="firstName" placeholder={t ? 'שם פרטי' : 'First name'} error={errors.firstName?.message} {...register('firstName')} />
        </div>
        <div>
          <Label he="שם משפחה" en="Last Name" htmlFor="lastName" required />
          <Input id="lastName" placeholder={t ? 'שם משפחה' : 'Last name'} error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <div>
          <Label he="גיל" en="Age" htmlFor="age" required />
          <Input id="age" type="number" numeric placeholder="גיל" error={errors.age?.message} {...register('age')} />
        </div>
        <div>
          <Label he="תאריך לידה עברי + שנה" en="Hebrew Birthday + Year" htmlFor="hebrewBirthday" required />
          <Input id="hebrewBirthday" placeholder='לדוג׳: כ"ג תשרי תשפ"ה' error={errors.hebrewBirthday?.message} {...register('hebrewBirthday')} />
        </div>
        <div>
          <Label he="סטטוס" en="Status" htmlFor="status" required />
          <SelectField id="status" options={MARITAL_STATUS_MALE} placeholder={t ? 'בחר סטטוס' : 'Select status'} locale={locale} error={errors.status?.message} defaultValue="" {...register('status')} />
        </div>
        <div>
          <Label he="השתייכות / קהילה" en="Community" htmlFor="community" required />
          <Input id="community" placeholder={t ? 'קהילה / זרם' : 'Community'} error={errors.community?.message} {...register('community')} />
        </div>
        <div>
          <Label he="עיסוק / לימודים" en="Occupation / Studies" htmlFor="occupation" required />
          <Input id="occupation" placeholder={t ? 'מקצוע / לימודים' : 'Occupation'} error={errors.occupation?.message} {...register('occupation')} />
        </div>
        <div>
          <Label he="עיר מגורים" en="City" htmlFor="city" required />
          <Input id="city" placeholder={t ? 'עיר' : 'City'} error={errors.city?.message} {...register('city')} />
        </div>
        <div>
          <Label he="מספר טלפון" en="Phone" htmlFor="phone" required />
          <Input id="phone" type="tel" numeric placeholder="0501234567" error={errors.phone?.message} {...register('phone')} />
        </div>
        <div>
          <Label he='אימייל' en="Email" htmlFor="email" required />
          <Input id="email" type="email" numeric placeholder="example@email.com" error={errors.email?.message} {...register('email')} />
        </div>
      </div>
    </FormSection>
  )
}
