'use client'

import { cn } from '@/lib/utils'
import type { SpotCategory, SpotRegion } from '@/types/dateSpots'
import { CATEGORY_LABELS, REGION_LABELS, REGION_ORDER } from '@/types/dateSpots'

export interface FilterState {
  search:   string
  category: SpotCategory | 'all'
  region:   SpotRegion   | 'all'
}

interface SpotFiltersProps {
  filters:    FilterState
  onChange:   (f: FilterState) => void
  totalShown: number
  totalAll:   number
  locale?:    string
}

export function SpotFilters({ filters, onChange, totalShown, totalAll, locale = 'he' }: SpotFiltersProps) {
  const isHe = locale === 'he'
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })

  const CATEGORIES: Array<{ value: SpotCategory | 'all'; label: string }> = [
    { value: 'all',         label: isHe ? 'הכל' : 'All' },
    { value: 'restaurant',  label: isHe ? CATEGORY_LABELS.restaurant.he  : CATEGORY_LABELS.restaurant.en },
    { value: 'hotel_lobby', label: isHe ? CATEGORY_LABELS.hotel_lobby.he : CATEGORY_LABELS.hotel_lobby.en },
    { value: 'park',        label: isHe ? CATEGORY_LABELS.park.he        : CATEGORY_LABELS.park.en },
    { value: 'quiet',       label: isHe ? CATEGORY_LABELS.quiet.he       : CATEGORY_LABELS.quiet.en },
    { value: 'other',       label: isHe ? CATEGORY_LABELS.other.he       : CATEGORY_LABELS.other.en },
  ]

  const REGIONS: Array<{ value: SpotRegion | 'all'; label: string }> = [
    { value: 'all', label: isHe ? 'כל הארץ' : 'All Regions' },
    ...REGION_ORDER.map((value) => ({ value, label: isHe ? REGION_LABELS[value].he : REGION_LABELS[value].en })),
  ]

  const activeCategory = filters.category !== 'all' ? CATEGORY_LABELS[filters.category] : null
  const activeRegion   = filters.region   !== 'all' ? REGION_LABELS[filters.region]     : null

  return (
    <div className="flex flex-col gap-4" dir={isHe ? 'rtl' : 'ltr'}>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder={isHe ? 'חיפוש לפי עיר, שם מקום, כתובת או סוג...' : 'Search by city, place name, address or type...'}
          className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition"
          dir={isHe ? 'rtl' : 'ltr'}
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => set({ search: '' })}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => set({ category: value })}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all duration-150',
              filters.category === value
                ? 'bg-navy-600 text-white border-navy-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300 hover:text-navy-600',
            )}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Region selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 shrink-0">
          {isHe ? 'אזור:' : 'Region:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set({ region: value })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                filters.region === value
                  ? 'bg-burgundy-600 text-white border-burgundy-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-burgundy-300 hover:text-burgundy-600',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <span className="text-xs text-gray-400 ms-auto">
          {totalShown === totalAll
            ? isHe ? `${totalAll} מקומות` : `${totalAll} spots`
            : isHe ? `${totalShown} מתוך ${totalAll} מקומות` : `${totalShown} of ${totalAll} spots`}
        </span>
      </div>

      {/* Active filters summary */}
      {(filters.search || filters.category !== 'all' || filters.region !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">{isHe ? 'סינון פעיל:' : 'Active filters:'}</span>
          {filters.search && (
            <span className="text-xs bg-navy-50 text-navy-700 border border-navy-200 rounded-full px-2.5 py-0.5">
              &ldquo;{filters.search}&rdquo;
            </span>
          )}
          {activeCategory && (
            <span className="text-xs bg-navy-50 text-navy-700 border border-navy-200 rounded-full px-2.5 py-0.5">
              {isHe ? activeCategory.he : activeCategory.en}
            </span>
          )}
          {activeRegion && (
            <span className="text-xs bg-burgundy-50 text-burgundy-700 border border-burgundy-200 rounded-full px-2.5 py-0.5">
              {isHe ? activeRegion.he : activeRegion.en}
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange({ search: '', category: 'all', region: 'all' })}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
          >
            {isHe ? 'נקה הכל' : 'Clear all'}
          </button>
        </div>
      )}
    </div>
  )
}
