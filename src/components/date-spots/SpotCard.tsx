'use client'

import { useState } from 'react'
import type { DateSpot } from '@/types/dateSpots'
import { CATEGORY_LABELS } from '@/types/dateSpots'
import { StarDisplay, StarInput } from './StarRating'

// ─── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({
  onSubmit,
  locale,
}: {
  onSubmit: (name: string, rating: number, text: string) => void
  locale: string
}) {
  const isHe = locale === 'he'
  const [name,   setName]   = useState('')
  const [rating, setRating] = useState(0)
  const [text,   setText]   = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || rating === 0 || !text.trim()) return
    onSubmit(name.trim(), rating, text.trim())
    setName(''); setRating(0); setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-4 border-t border-gray-100"
      dir={isHe ? 'rtl' : 'ltr'}>
      <p className="text-sm font-bold text-navy-700">
        {isHe ? 'הוסף ביקורת' : 'Add a Review'}
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={isHe ? 'שם (ראשי תיבות בלבד)' : 'Name (initials only)'}
        maxLength={10}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none
          focus:ring-2 focus:ring-navy-300 focus:border-navy-400"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">
          {isHe ? 'דירוג:' : 'Rating:'}
        </span>
        <StarInput value={rating} onChange={setRating} size="md" />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isHe ? 'שתף את החוויה שלך...' : 'Share your experience...'}
        rows={2}
        maxLength={200}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400"
      />

      <button
        type="submit"
        disabled={rating === 0 || !name.trim() || !text.trim()}
        className="self-start px-4 py-2 rounded-lg bg-navy-600 hover:bg-navy-700
          disabled:opacity-40 text-white text-sm font-semibold transition-colors"
      >
        {isHe ? 'שלח ביקורת' : 'Submit Review'}
      </button>
    </form>
  )
}

// ─── Spot Card ────────────────────────────────────────────────────────────────

interface SpotCardProps {
  spot:    DateSpot
  locale?: string
}

export function SpotCard({ spot, locale = 'he' }: SpotCardProps) {
  const isHe = locale === 'he'
  const [expanded,     setExpanded]     = useState(false)
  const [localReviews, setLocalReviews] = useState(spot.reviews)
  const [localRating,  setLocalRating]  = useState(spot.averageRating)
  const [submitted,    setSubmitted]    = useState(false)

  const cat = CATEGORY_LABELS[spot.category]

  const handleNewReview = (name: string, rating: number, text: string) => {
    const newReview = {
      id: `local-${Date.now()}`,
      authorName: name,
      rating,
      text,
      createdAt: new Date().toISOString().split('T')[0],
    }
    const updated = [newReview, ...localReviews]
    setLocalReviews(updated)
    const avg = updated.reduce((sum, r) => sum + r.rating, 0) / updated.length
    setLocalRating(Math.round(avg * 10) / 10)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-luxury
      transition-shadow duration-200 flex flex-col overflow-hidden">

      {/* ── Header band ── */}
      <div className="bg-gradient-to-l from-navy-50 to-navy-100 px-5 py-3 flex items-center justify-between gap-2">
        <span className="text-lg">{cat.emoji}</span>
        <span className="text-xs font-semibold text-navy-600 bg-white/70 rounded-full px-2.5 py-0.5">
          {isHe ? cat.he : cat.en}
        </span>
        {spot.kosher !== undefined && (
          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
            spot.kosher ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {spot.kosher
              ? (isHe ? '✓ כשר' : '✓ Kosher')
              : (isHe ? 'לא כשר' : 'Not Kosher')}
          </span>
        )}
        {spot.priceRange && (
          <span className="text-xs text-gray-500 ms-auto font-mono">{spot.priceRange}</span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-3 px-5 py-4 flex-1">
        <div>
          <h3 className="text-base font-bold text-navy-800 leading-snug">{spot.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">📍 {spot.city}</p>
        </div>

        <StarDisplay rating={localRating} reviewCount={localReviews.length} size="sm" />

        {/* Vibe — user-generated content, keep in original language */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{spot.vibe}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
          {spot.googleMapsUrl && (
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-600 hover:bg-navy-700
                text-white text-xs font-semibold transition-colors duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {isHe ? 'הנחיות לניווט' : 'Get Directions'}
            </a>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200
              text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
          >
            {expanded
              ? (isHe ? 'סגור' : 'Close')
              : isHe
                ? `ביקורות (${localReviews.length})`
                : `Reviews (${localReviews.length})`}
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expandable reviews panel ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-4 bg-gray-50/50">

          {/* Existing reviews — keep review text in original language per spec */}
          {localReviews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {localReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-navy-700">{review.authorName}</span>
                    <span className="text-[10px] text-gray-400">{review.createdAt}</span>
                  </div>
                  <StarDisplay rating={review.rating} size="sm" showNumber={false} />
                  <p className="text-xs text-gray-600 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">
              {isHe ? 'אין ביקורות עדיין — היה הראשון!' : 'No reviews yet — be the first!'}
            </p>
          )}

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 text-center">
              {isHe ? '✅ הביקורת נשלחה — תודה!' : '✅ Review submitted — thank you!'}
            </div>
          )}

          <ReviewForm onSubmit={handleNewReview} locale={locale} />
        </div>
      )}
    </article>
  )
}
