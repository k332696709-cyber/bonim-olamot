'use client'

import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { FormSection } from '@/components/ui/FormSection'
import { MARITAL_STATUS_OPTIONS } from '@/constants/formOptions'
import type { FemaleRegistrationData } from '@/lib/validations/femaleRegistration'

interface Props {
  locale: string
}

export function PersonalInfoSection({ locale }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FemaleRegistrationData>()

  const t = locale === 'he'
  const sectionTitle = t ? 'פרטים אישיים' : 'Personal Information'

  return (
    <FormSection title={sectionTitle}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* First Name */}
        <div>
          <Label he="שם פרטי" en="First Name" htmlFor="firstName" required />
          <Input
            id="firstName"
            placeholder={t ? 'הכנסי שם פרטי' : 'Enter first name'}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>

        {/* Last Name */}
        <div>
          <Label he="שם משפחה" en="Last Name" htmlFor="lastName" required />
          <Input
            id="lastName"
            placeholder={t ? 'הכנסי שם משפחה' : 'Enter last name'}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {/* Age */}
        <div>
          <Label he="גיל" en="Age" htmlFor="age" required />
          <Input
            id="age"
            type="number"
            min={18}
            max={120}
            numeric
            placeholder={t ? 'גיל' : 'Age'}
            error={errors.age?.message}
            {...register('age')}
          />
        </div>

        {/* Hebrew Birthday */}
        <div>
          <Label he="תאריך לידה עברי" en="Hebrew Birthday" htmlFor="hebrewBirthday" required />
          <Input
            id="hebrewBirthday"
            placeholder={t ? 'לדוג׳: כ"ג תשרי תשפ"ה' : 'e.g. 23 Tishrei 5785'}
            error={errors.hebrewBirthday?.message}
            {...register('hebrewBirthday')}
          />
        </div>

        {/* Marital Status */}
        <div>
          <Label he="מצב משפחתי" en="Marital Status" htmlFor="status" required />
          <SelectField
            id="status"
            options={MARITAL_STATUS_OPTIONS}
            placeholder={t ? 'בחרי מצב משפחתי' : 'Select marital status'}
            locale={locale}
            error={errors.status?.message}
            defaultValue=""
            {...register('status')}
          />
        </div>

        {/* Community */}
        <div>
          <Label he="קהילה" en="Community" htmlFor="community" required />
          <Input
            id="community"
            placeholder={t ? 'קהילה / זרם' : 'Community / Stream'}
            error={errors.community?.message}
            {...register('community')}
          />
        </div>

        {/* Occupation */}
        <div>
          <Label he="עיסוק" en="Occupation" htmlFor="occupation" required />
          <Input
            id="occupation"
            placeholder={t ? 'מקצוע / עיסוק' : 'Profession / Occupation'}
            error={errors.occupation?.message}
            {...register('occupation')}
          />
        </div>

        {/* City */}
        <div>
          <Label he="עיר" en="City" htmlFor="city" required />
          <Input
            id="city"
            placeholder={t ? 'עיר מגורים' : 'City of residence'}
            error={errors.city?.message}
            {...register('city')}
          />
        </div>

        {/* Phone */}
        <div>
          <Label he="טלפון" en="Phone" htmlFor="phone" required />
          <Input
            id="phone"
            type="tel"
            numeric
            placeholder="0501234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* Email */}
        <div>
          <Label he='דוא"ל' en="Email" htmlFor="email" required />
          <Input
            id="email"
            type="email"
            numeric
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

      </div>
    </FormSection>
  )
}
