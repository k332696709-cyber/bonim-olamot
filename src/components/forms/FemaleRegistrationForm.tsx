'use client'

import { useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { femaleRegistrationSchema, type FemaleRegistrationData } from '@/lib/validations/femaleRegistration'
import { FemalePersonalSection } from './female/FemalePersonalSection'
import { FemaleStyleSection } from './female/FemaleStyleSection'
import { FemaleValuesSection } from './female/FemaleValuesSection'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { FormSection } from '@/components/ui/FormSection'
import { Button } from '@/components/ui/Button'
import { PricingPlans, type PlanType } from '@/components/ui/PricingPlans'
import { PaymentForm, type PaymentData } from '@/components/ui/PaymentForm'

export function FemaleRegistrationForm({ locale }: { locale: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [plan, setPlan] = useState<PlanType>('free')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const t = locale === 'he'

  const methods = useForm<FemaleRegistrationData>({
    resolver: zodResolver(femaleRegistrationSchema),
    defaultValues: { traits: [], relationshipValues: [], brings: [], photos: [], preferredStream: '', doesntSuit: '', aboutMe: '', aboutPartner: '' },
    mode: 'onBlur',
  })

  const { handleSubmit, control, formState: { isSubmitting, errors } } = methods
  const hasErrors = Object.keys(errors).length > 0

  const onSubmit = async (data: FemaleRegistrationData) => {
    console.log('Female form submitted:', { ...data, plan })
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
        <h2 className="text-xl font-semibold text-navy-500 mb-2">{t ? 'הטופס נשלח בהצלחה!' : 'Form submitted successfully!'}</h2>
        <p className="text-gray-500 text-sm">{t ? 'נחזור אלייך בהקדם.' : 'We will be in touch soon.'}</p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6 pb-10">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-serif font-bold text-navy-500">{t ? 'טופס הרשמה – מיועדת' : 'Female Registration Form'}</h1>
          <p className="text-sm text-gray-400 mt-1">{t ? 'שדות המסומנים ב-* הם חובה' : 'Fields marked * are required'}</p>
        </div>

        {/* Pricing plans */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
          <PricingPlans selected={plan} onChange={setPlan} locale={locale} gender="female" />
        </div>

        <FemalePersonalSection locale={locale} />

        {/* Photos */}
        <FormSection title={t ? 'תמונות שידוכים' : 'Matchmaking Photos'} subtitle={t ? 'ניתן להעלות עד 5 תמונות' : 'Up to 5 photos'}>
          <Controller name="photos" control={control} render={({ field }) => (
            <PhotoUpload value={field.value} onChange={field.onChange} max={5} locale={locale} />
          )} />
        </FormSection>

        <FemaleStyleSection locale={locale} />
        <FemaleValuesSection locale={locale} />

        {/* Payment — shown only for premium */}
        {plan === 'premium' && (
          <FormSection
            title={t ? 'פרטי תשלום' : 'Payment Details'}
            subtitle={t ? 'מנוי פרימיום – 3 × ₪250' : 'Premium Plan – 3 × ₪250'}
          >
            <PaymentForm locale={locale} onDataChange={setPaymentData} />
          </FormSection>
        )}

        {hasErrors && (
          <div className="bg-burgundy-50 border border-burgundy-200 rounded-xl px-5 py-4">
            <p className="text-burgundy-600 text-sm font-medium">
              {t ? 'יש שגיאות בטופס. אנא תקני לפני שליחה.' : 'There are errors. Please fix them before submitting.'}
            </p>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button type="submit" size="lg" loading={isSubmitting} className="min-w-48">
            {isSubmitting ? (t ? 'שולח...' : 'Submitting...') : (t ? 'שלח טופס' : 'Submit Form')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
