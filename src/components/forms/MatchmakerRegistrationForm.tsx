'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const SECTORS = [
  { value: 'hasidic',        he: 'חסידי',        en: 'Hasidic' },
  { value: 'litvish',        he: 'ליטאי',        en: 'Litvish' },
  { value: 'sephardic',      he: 'עדות המזרח',   en: 'Sephardic' },
  { value: 'first_marriage',  he: "פרק א'",       en: 'First Marriage' },
  { value: 'second_marriage', he: "פרק ב'",       en: 'Second Marriage' },
]

const schema = z.object({
  firstName:       z.string().min(2, 'Required'),
  lastName:        z.string().min(2, 'Required'),
  email:           z.string().email('Invalid email'),
  phone:           z.string().regex(/^05\d{8}$/, 'Invalid phone (05XXXXXXXX)'),
  idNumber:        z.string().regex(/^\d{9}$/, 'ID must be 9 digits'),
  yearsExperience: z.coerce.number().min(0, 'Invalid').max(80, 'Invalid'),
  sectors:         z.array(z.string()).min(1, 'Select at least one sector'),
})

type FormData = z.infer<typeof schema>

export function MatchmakerRegistrationForm({ locale = 'he' }: { locale?: string }) {
  const isHe = locale === 'he'
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sectors: [] },
    mode: 'onBlur',
  })

  const onSubmit = async (data: FormData) => {
    console.log('Matchmaker registration:', data)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-navy-500 mb-2">
          {isHe ? 'בקשתך התקבלה!' : 'Application Received!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isHe ? 'בקשתך התקבלה ונמצאת בבדיקה' : 'Your application has been received and is pending review'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 pb-10"
      dir={isHe ? 'rtl' : 'ltr'}>
      <div className="text-center mb-2">
        <h1 className="text-2xl font-serif font-bold text-navy-500">
          {isHe ? 'הרשמת שדכנים' : 'Matchmaker Registration'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isHe ? 'כל השדות המסומנים ב-* הם חובה' : 'Fields marked * are required'}
        </p>
      </div>

      {/* Personal Details */}
      <FormSection title={isHe ? 'פרטים אישיים' : 'Personal Details'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              {isHe ? 'שם פרטי' : 'First Name'} <span className="text-burgundy-500">*</span>
            </label>
            <Input
              placeholder={isHe ? 'שם פרטי' : 'First name'}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              {isHe ? 'שם משפחה' : 'Last Name'} <span className="text-burgundy-500">*</span>
            </label>
            <Input
              placeholder={isHe ? 'שם משפחה' : 'Last name'}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              {isHe ? 'מייל' : 'Email'} <span className="text-burgundy-500">*</span>
            </label>
            <Input
              type="email"
              numeric
              placeholder="example@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              {isHe ? 'טלפון' : 'Phone'} <span className="text-burgundy-500">*</span>
            </label>
            <Input
              type="tel"
              numeric
              placeholder="0501234567"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              {isHe ? 'מספר ת.ז' : 'ID Number'} <span className="text-burgundy-500">*</span>
            </label>
            <Input
              numeric
              placeholder="000000000"
              maxLength={9}
              error={errors.idNumber?.message}
              {...register('idNumber')}
              className="max-w-xs"
            />
          </div>
        </div>
      </FormSection>

      {/* Professional Experience */}
      <FormSection title={isHe ? 'ניסיון מקצועי' : 'Professional Experience'}>
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
            {isHe ? 'שנות ניסיון' : 'Years of Experience'} <span className="text-burgundy-500">*</span>
          </label>
          <Input
            type="number"
            numeric
            min={0}
            max={80}
            placeholder="0"
            error={errors.yearsExperience?.message}
            {...register('yearsExperience')}
            className="max-w-xs"
          />
        </div>
      </FormSection>

      {/* Sector Specialization */}
      <FormSection
        title={isHe ? 'מגזר התעסקות' : 'Sector Specialization'}
        subtitle={isHe ? 'ניתן לבחור יותר מאפשרות אחת' : 'You may select more than one'}
      >
        <Controller
          name="sectors"
          control={control}
          render={({ field }) => (
            <SectorSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.sectors?.message}
              locale={locale}
            />
          )}
        />
      </FormSection>

      <div className="flex justify-center pt-2">
        <Button type="submit" size="lg" loading={isSubmitting} className="min-w-52">
          {isSubmitting
            ? (isHe ? 'שולח...' : 'Submitting...')
            : (isHe ? 'שלח הרשמה' : 'Submit Registration')}
        </Button>
      </div>
    </form>
  )
}

function SectorSelector({
  value,
  onChange,
  error,
  locale = 'he',
}: {
  value: string[]
  onChange: (v: string[]) => void
  error?: string
  locale?: string
}) {
  const isHe = locale === 'he'
  const allValues = SECTORS.map((s) => s.value)
  const allSelected = allValues.length > 0 && allValues.every((v) => value.includes(v))

  const toggleAll = () => {
    onChange(allSelected ? [] : allValues)
  }

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleAll}
          className={cn(
            'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 select-none',
            allSelected
              ? 'bg-navy-500 border-navy-500 text-white shadow-sm'
              : 'border-gray-300 text-gray-700 hover:border-navy-400 hover:text-navy-600 bg-white',
          )}
        >
          {isHe ? 'הכל' : 'All'}
        </button>
        {SECTORS.map((sector) => {
          const isSelected = value.includes(sector.value)
          return (
            <button
              key={sector.value}
              type="button"
              onClick={() => toggle(sector.value)}
              className={cn(
                'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 select-none',
                isSelected
                  ? 'bg-navy-500 border-navy-500 text-white shadow-sm'
                  : 'border-gray-300 text-gray-700 hover:border-navy-400 hover:text-navy-600 bg-white',
              )}
            >
              {isHe ? sector.he : sector.en}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="mt-2 text-xs text-green-600">
          {value.length === allValues.length
            ? (isHe ? 'כל המגזרים נבחרו' : 'All sectors selected')
            : isHe ? `נבחרו ${value.length} מגזרים` : `${value.length} sector(s) selected`}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-burgundy-500">{error}</p>}
    </div>
  )
}
