'use client'

import { cn } from '@/lib/utils'

export type PlanType = 'free' | 'premium'

interface PricingPlansProps {
  selected: PlanType
  onChange: (plan: PlanType) => void
  locale?: string
  gender?: 'male' | 'female'
}

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

export function PricingPlans({ selected, onChange, locale = 'he', gender = 'female' }: PricingPlansProps) {
  const t = locale === 'he'
  const candidateWord = gender === 'male'
    ? (t ? 'מיועדים' : 'male candidates')
    : (t ? 'מיועדות' : 'female candidates')

  const freeFeatures = [
    t ? 'הרשמה למאגר השידוכים' : 'Registration to matchmaking database',
    t ? 'יצירת פרופיל אישי' : 'Create a personal profile',
    t ? 'יכולת עריכת הרזומה בכל עת' : 'Edit your resume/profile at any time',
  ]

  const premiumFeatures = [
    t ? 'הרשמה למאגר השידוכים' : 'Registration to matchmaking database',
    t ? 'יצירת פרופיל אישי' : 'Create a personal profile',
    t ? 'יכולת עריכת הרזומה בכל עת' : 'Edit your resume/profile at any time',
    t ? 'פגישה אישית עם שדכן/ת' : 'Personal meeting with a matchmaker',
    t
      ? `מפגש חודשי לפי סגנון וגיל עם ${candidateWord} שבתהליך`
      : `Monthly meeting by style & age with ${candidateWord} in process`,
    t ? 'ייעוץ עם מנטור / יועץ זוגיות' : 'Consultation with a mentor / relationship counselor',
    t ? 'קידום ועדיפות באתר' : 'Priority & promotion on the site',
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center mb-1">
        <h2 className="text-lg font-semibold text-navy-600">
          {t ? 'בחר את המנוי המתאים לך' : 'Choose your plan'}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {t ? 'ניתן לשדרג בכל עת' : 'You can upgrade at any time'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Free Plan */}
        <button
          type="button"
          onClick={() => onChange('free')}
          className={cn(
            'flex flex-col text-start rounded-2xl border-2 p-5 transition-all duration-150 cursor-pointer',
            selected === 'free'
              ? 'border-navy-400 bg-navy-50 shadow-luxury ring-2 ring-navy-200'
              : 'border-gray-200 bg-white hover:border-navy-200 hover:shadow-card',
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <p className="font-bold text-navy-600 text-lg">
                {t ? 'מנוי חינם' : 'Free Plan'}
              </p>
              <p className="text-2xl font-serif font-bold text-navy-500 mt-0.5">
                ₪0
                <span className="text-sm font-normal text-gray-400 ms-1">
                  {t ? '/ תמיד' : '/ always'}
                </span>
              </p>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-colors',
              selected === 'free' ? 'border-navy-500 bg-navy-500' : 'border-gray-300',
            )}>
              {selected === 'free' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-navy-400"><CheckIcon /></span>
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Premium Plan */}
        <button
          type="button"
          onClick={() => onChange('premium')}
          className={cn(
            'flex flex-col text-start rounded-2xl border-2 p-5 transition-all duration-150 cursor-pointer relative overflow-hidden',
            selected === 'premium'
              ? 'border-burgundy-400 bg-burgundy-50 shadow-luxury ring-2 ring-burgundy-200'
              : 'border-burgundy-100 bg-white hover:border-burgundy-300 hover:shadow-card',
          )}
        >
          {/* Popular badge */}
          <div className="absolute top-3 start-3 bg-burgundy-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {t ? '⭐ מומלץ' : '⭐ Recommended'}
          </div>

          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-4 mt-7">
            <div>
              <p className="font-bold text-burgundy-600 text-lg">
                {t ? 'מנוי פרימיום' : 'Premium Plan'}
              </p>
              <div className="mt-0.5">
                <p className="text-2xl font-serif font-bold text-burgundy-500">
                  3 × ₪250
                </p>
                <p className="text-sm text-burgundy-400 font-medium">
                  {t ? '= ₪750 סה"כ' : '= ₪750 total'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t ? '3 תשלומים חודשיים' : '3 monthly payments'}
                </p>
              </div>
            </div>
            <div className={cn(
              'w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-colors',
              selected === 'premium' ? 'border-burgundy-500 bg-burgundy-500' : 'border-gray-300',
            )}>
              {selected === 'premium' && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2">
            {premiumFeatures.map((f, i) => (
              <li key={i} className={cn(
                'flex items-start gap-2 text-sm',
                i < 3 ? 'text-gray-500' : 'text-gray-800 font-medium',
              )}>
                <span className={i < 3 ? 'text-gray-400' : 'text-burgundy-500'}>
                  {i < 3 ? <CheckIcon /> : <StarIcon />}
                </span>
                {f}
              </li>
            ))}
          </ul>
        </button>

      </div>

      {/* Selected indicator */}
      <p className="text-center text-xs text-gray-400">
        {selected === 'free'
          ? (t ? 'בחרת מנוי חינם — ניתן לשדרג לאחר ההרשמה' : 'Free plan selected — you can upgrade after registration')
          : (t ? 'בחרת מנוי פרימיום — נחזור אלייך לתיאום לאחר ההרשמה' : 'Premium selected — we\'ll contact you after registration')}
      </p>
    </div>
  )
}
