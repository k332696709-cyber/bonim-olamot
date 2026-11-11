'use client'

import { useState, useMemo } from 'react'
import type { DateSpot } from '@/types/dateSpots'
import { CATEGORY_LABELS, REGION_LABELS } from '@/types/dateSpots'
import { SpotFilters, type FilterState } from './SpotFilters'
import { SpotCard } from './SpotCard'
import { Reveal } from '@/components/home/Reveal'

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
      // Free search over everything the visitor might type: name, city, address, description,
      // category and region, in Hebrew or English. Every word must match somewhere.
      const haystack = [
        spot.name, spot.city, spot.address ?? '', spot.vibe,
        CATEGORY_LABELS[spot.category]?.he, CATEGORY_LABELS[spot.category]?.en,
        REGION_LABELS[spot.region]?.he, REGION_LABELS[spot.region]?.en,
      ].join(' ').toLowerCase()
      const words = filters.search.trim().toLowerCase().split(/s+/).filter(Boolean)
      const matchSearch = words.every((w) => haystack.includes(w))

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
          {filtered.map((spot, i) => (
            <Reveal key={spot.id} delay={(i % 3) * 120}>
              <SpotCard spot={spot} locale={locale} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
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
