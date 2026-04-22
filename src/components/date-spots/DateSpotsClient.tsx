'use client'

import { useState, useMemo } from 'react'
import type { DateSpot } from '@/types/dateSpots'
import { SpotFilters, type FilterState } from './SpotFilters'
import { SpotCard } from './SpotCard'

interface DateSpotsClientProps {
  spots:   DateSpot[]
  locale?: string
}

const DEFAULT_FILTERS: FilterState = {
  search:   '',
  category: 'all',
  region:   'all',
}

export function DateSpotsClient({ spots, locale = 'he' }: DateSpotsClientProps) {
  const isHe = locale === 'he'
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return spots.filter((spot) => {
      const q = filters.search.trim().toLowerCase()
      const matchSearch =
        !q ||
        spot.name.toLowerCase().includes(q) ||
        spot.city.toLowerCase().includes(q) ||
        spot.vibe.toLowerCase().includes(q)

      const matchCategory =
        filters.category === 'all' || spot.category === filters.category

      const matchRegion =
        filters.region === 'all' || spot.region === filters.region

      return matchSearch && matchCategory && matchRegion
    })
  }, [spots, filters])

  return (
    <div className="flex flex-col gap-8">

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
        <SpotFilters
          filters={filters}
          onChange={setFilters}
          totalShown={filtered.length}
          totalAll={spots.length}
          locale={locale}
        />
      </div>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-5xl">🔍</span>
          <p className="text-lg font-semibold text-gray-500">
            {isHe ? 'לא נמצאו מקומות התואמים לחיפוש' : 'No spots match your search'}
          </p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-sm text-navy-600 hover:underline"
          >
            {isHe ? 'נקה פילטרים' : 'Clear filters'}
          </button>
        </div>
      )}
    </div>
  )
}
