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
  { value: 'hasidic',        he: 'חסידי' },
  { value: 'litvish',        he: 'ליטאי' },
  { value: 'sephardic',      he: 'עדות המזרח' },
  { value: 'first_marriage',  he: "פרק א'" },
  { value: 'second_marriage', he: "פרק ב'" },
]

const schema = z.object({
  firstName:       z.string().min(2, 'שם פרטי חובה'),
  lastName:        z.string().min(2, 'שם משפחה חובה'),
  email:           z.string().email('כתובת מייל לא תקינה'),
  phone:           z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין (05XXXXXXXX)'),
  idNumber:        z.string().regex(/^\d{9}$/, 'מספר ת.ז חייב להכיל 9 ספרות'),
  yearsExperience: z.coerce.number().min(0, 'ערך לא תקין').max(80, 'ערך לא תקין'),
  sectors:         z.array(z.string()).min(1, 'יש לבחור לפחות מגזר אחד'),
})

type FormData = z.infer<typeof schema>

export function MatchmakerRegistrationForm() {
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
        <h2 className="text-xl font-semibold text-navy-500 mb-2">בקשתך התקבלה!</h2>
        <p className="text-gray-500 text-sm">בקשתך התקבלה ונמצאת בבדיקה</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 pb-10">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-serif font-bold text-navy-500">הרשמת שדכנים</h1>
        <p className="text-sm text-gray-400 mt-1">כל השדות המסומנים ב-* הם חובה</p>
      </div>

      {/* Personal Details */}
      <FormSection title="פרטים אישיים">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              שם פרטי <span className="text-burgundy-500">*</span>
            </label>
            <Input
              placeholder="שם פרטי"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              שם משפחה <span className="text-burgundy-500">*</span>
            </label>
            <Input
              placeholder="שם משפחה"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <div>
            <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
              מייל <span className="text-burgundy-500">*</span>
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
              טלפון <span className="text-burgundy-500">*</span>
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
              מספר ת.ז <span className="text-burgundy-500">*</span>
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
      <FormSection title="ניסיון מקצועי">
        <div>
          <label className="block mb-1.5 font-semibold text-navy-500 text-sm">
            שנות ניסיון <span className="text-burgundy-500">*</span>
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
      <FormSection title="מגזר התעסקות" subtitle="ניתן לבחור יותר מאפשרות אחת">
        <Controller
          name="sectors"
          control={control}
          render={({ field }) => (
            <SectorSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.sectors?.message}
            />
          )}
        />
      </FormSection>

      <div className="flex justify-center pt-2">
        <Button type="submit" size="lg" loading={isSubmitting} className="min-w-52">
          {isSubmitting ? 'שולח...' : 'שלח הרשמה'}
        </Button>
      </div>
    </form>
  )
}

function SectorSelector({
  value,
  onChange,
  error,
}: {
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}) {
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
          הכל
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
              {sector.he}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="mt-2 text-xs text-green-600">
          {value.length === allValues.length ? 'כל המגזרים נבחרו' : `נבחרו ${value.length} מגזרים`}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-burgundy-500">{error}</p>}
    </div>
  )
}
