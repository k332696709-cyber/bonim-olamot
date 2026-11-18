'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS } from '@/types/dateSpots'
import type { SpotCategory } from '@/types/dateSpots'

interface Spot {
  id: string; name: string; city: string; category: string; vibe: string
  googleMapsUrl: string | null; kmFromMe: number; kmFromThem: number
}
interface Ideas {
  myCity: string; theirCity: string; theirGender: 'male' | 'female'
  veryClose: boolean; distanceBetween: number | null
  nearMe: Spot[]; nearThem: Spot[]; middle: Spot[]; located: boolean
}

/**
 * Date places for two people who are both interested: near each of them, and in the middle when
 * they live far apart. Based on the city of residence of each.
 */
export function DateIdeasModal({ id, he, onClose }: { id: string; he: boolean; onClose: () => void }) {
  const [ideas, setIdeas] = useState<Ideas | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await createClient().auth.getSession()
        const res = await fetch(`/api/candidate/proposals/${id}/dates`, { headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.message ?? 'bad')
        if (alive) setIdeas(json.ideas)
      } catch (e) {
        if (alive) setError(e instanceof Error && e.message !== 'bad' ? e.message : he ? 'לא הצלחנו לטעון מקומות. נסו שוב.' : 'Could not load places. Try again.')
      }
    })()
    return () => { alive = false }
  }, [id, he])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const other = ideas?.theirGender === 'female' ? (he ? 'ממנה' : 'her') : (he ? 'ממנו' : 'him')

  const spotCard = (s: Spot, showBoth: boolean) => (
    <li key={s.id} className="rounded-2xl border border-navy-100 p-4 flex flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold text-navy-800">{s.name}</p>
        <span className="text-[11px] rounded-full bg-navy-50 text-navy-600 px-2.5 py-0.5 shrink-0">
          {CATEGORY_LABELS[s.category as SpotCategory]?.[he ? 'he' : 'en'] ?? ''}
        </span>
      </div>
      <p className="text-sm text-navy-500">{s.city}</p>
      {s.vibe && <p className="text-sm text-navy-600">{s.vibe}</p>}
      <p className="text-xs text-navy-400">
        {showBoth
          ? (he ? `כ-${s.kmFromMe} ק״מ ממך, כ-${s.kmFromThem} ק״מ ${other}` : `About ${s.kmFromMe} km from you, ${s.kmFromThem} km from ${other}`)
          : (he ? `כ-${s.kmFromMe} ק״מ ממך` : `About ${s.kmFromMe} km from you`)}
      </p>
      {s.googleMapsUrl && (
        <a href={s.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-semibold text-burgundy-600 underline mt-1">
          {he ? 'פתיחה במפה' : 'Open in maps'}
        </a>
      )}
    </li>
  )

  const section = (title: string, hint: string, list: Spot[], both: boolean) => (
    <section className="flex flex-col gap-3">
      <div>
        <h4 className="font-bold text-navy-800 text-lg">{title}</h4>
        <p className="text-sm text-navy-400">{hint}</p>
      </div>
      {list.length === 0
        ? <p className="text-sm text-navy-500">{he ? 'עוד אין מקומות מתאימים ברשימה.' : 'No matching places in the list yet.'}</p>
        : <ul className="flex flex-col gap-3">{list.map((s) => spotCard(s, both))}</ul>}
    </section>
  )

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose} dir={he ? 'rtl' : 'ltr'}>
      <div
        role="dialog" aria-modal="true"
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] shadow-luxury"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-navy-50">
          <h3 className="text-xl font-bold text-navy-800">{he ? 'מקומות לדייט' : 'Date places'}</h3>
          <button type="button" onClick={onClose} aria-label={he ? 'סגירה' : 'Close'} className="w-10 h-10 rounded-full bg-[#f1f1f1] text-navy-800 text-xl font-bold">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-7">
          {!ideas && !error && <p className="text-center text-navy-400 py-10">{he ? 'מחפשים מקומות...' : 'Looking for places…'}</p>}
          {error && <p className="text-center text-navy-500 py-10">{error}</p>}
          {ideas && !ideas.located && (
            <p className="rounded-2xl bg-[#f1f1f1] text-navy-600 text-sm px-4 py-3">
              {he
                ? 'לא הצלחנו לזהות את אחת הערים, ולכן אי אפשר לחשב קרבה. אפשר לעיין ברשימת מקומות לדייטים בעמוד "מקומות לדייטים".'
                : 'We could not recognise one of the cities, so we cannot work out distances. You can browse the Date Places page.'}
            </p>
          )}
          {ideas && ideas.located && (
            <>
              <p className="text-sm text-navy-600">
                {ideas.veryClose
                  ? (he ? `אתם גרים קרוב (${ideas.myCity} ו${ideas.theirCity}), אז מקום בעיר של כל אחד מכם יתאים.` : `You live close to each other, so a place in either city works.`)
                  : (he ? `אתם גרים במרחק של כ-${ideas.distanceBetween} ק״מ (${ideas.myCity} ו${ideas.theirCity}), ולכן הוספנו גם מקומות באמצע.` : `You live about ${ideas.distanceBetween} km apart, so we added places in the middle.`)}
              </p>
              {!ideas.veryClose && section(he ? 'באמצע, קרוב לשניכם' : 'In the middle', he ? 'המקומות שהנסיעה אליהם הכי קצרה לשניכם ושווה ככל האפשר.' : 'Places with the shortest, most even trip for both.', ideas.middle, true)}
              {section(he ? `קרוב אליך (${ideas.myCity})` : `Near you (${ideas.myCity})`, '', ideas.nearMe, false)}
              {section(he ? `קרוב ${ideas.theirGender === 'female' ? 'אליה' : 'אליו'} (${ideas.theirCity})` : `Near them (${ideas.theirCity})`, '', ideas.nearThem, true)}
            </>
          )}
          <p className="text-xs text-navy-400">
            {he ? 'המקומות מוצגים לפי עיר המגורים. כדאי להתאים ביניכם דרך השדכנית.' : 'Places are shown by city of residence. The matchmaker can help you agree.'}
          </p>
        </div>
      </div>
    </div>
  )
}
