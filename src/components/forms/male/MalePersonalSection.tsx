'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { SelectField } from '@/components/ui/SelectField'
import { FormSection } from '@/components/ui/FormSection'
import { MARITAL_STATUS_MALE } from '@/constants/formOptions'
import type { MaleRegistrationData } from '@/lib/validations/maleRegistration'
import { getT } from '@/lib/i18n/translations'

const HAS_CHILDREN_OPTIONS = [
  { value: 'true',  he: 'עם ילדים',   en: 'With Children' },
  { value: 'false', he: 'ללא ילדים',  en: 'Without Children' },
]

export function MalePersonalSection({ locale }: { locale: string }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<MaleRegistrationData>()
  const T = getT(locale)

  const statusValue      = watch('status')
  const hasChildrenValue = watch('hasChildren')
  const showChildrenFields = statusValue === 'divorced' || statusValue === 'widowed'

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
        <div className={showChildrenFields ? '' : 'md:col-span-2'}>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.status} <span className="text-burgundy-500">*</span></label>
          <SelectField id="status" options={MARITAL_STATUS_MALE} placeholder={T.placeholders.statusMale} locale={locale} error={errors.status?.message} defaultValue="" {...register('status')} />
        </div>

        {showChildrenFields && (
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.hasChildren} <span className="text-burgundy-500">*</span></label>
            <select
              className={[
                'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white',
                'focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400',
                'transition-colors duration-150 cursor-pointer',
                errors.hasChildren
                  ? 'border-burgundy-400 focus:ring-burgundy-300'
                  : 'border-gray-300 hover:border-navy-300',
              ].join(' ')}
              value={hasChildrenValue === undefined ? '' : String(hasChildrenValue)}
              onChange={(e) => {
                if (e.target.value === '') {
                  setValue('hasChildren', undefined, { shouldValidate: true })
                } else {
                  setValue('hasChildren', e.target.value === 'true', { shouldValidate: true })
                  if (e.target.value === 'false') setValue('numberOfChildren', undefined, { shouldValidate: true })
                }
              }}
            >
              <option value="" disabled>{T.placeholders.hasChildrenMale}</option>
              {HAS_CHILDREN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {locale === 'he' ? opt.he : opt.en}
                </option>
              ))}
            </select>
            {errors.hasChildren && (
              <p className="mt-1 text-xs text-burgundy-500 text-start">{errors.hasChildren.message}</p>
            )}
          </div>
        )}

        {showChildrenFields && hasChildrenValue === true && (
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">{T.fields.numberOfChildren} <span className="text-burgundy-500">*</span></label>
            <Input
              id="numberOfChildren"
              type="number"
              numeric
              placeholder={T.fields.numberOfChildren}
              error={errors.numberOfChildren?.message}
              {...register('numberOfChildren')}
            />
          </div>
        )}

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
