'use client'

import { useEffect, useRef, useState } from 'react'

const PHONE = '053-379-0008'
const WHATSAPP = '972533790008'
const EMAIL = 'b.w008833@gmail.com'

/**
 * The "contact us" block of the home page. While it scrolls into view a small burgundy half
 * circle rises, widens and turns into a big rounded panel; scrolling back shrinks it again.
 */
export function ContactRise({ he }: { he: boolean }) {
  const box = useRef<HTMLElement>(null)
  const [p, setP] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setP(1); return }
    let raf = 0
    const update = () => {
      raf = 0
      const el = box.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const v = (vh - r.top) / (vh * 0.75)
      setP(Math.max(0, Math.min(1, v)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const e = 1 - Math.pow(1 - p, 3)
  const radius = `${Math.round(50 - 22 * e)}px`
  const tel = PHONE.replace(/-/g, '')
  const content = Math.max(0, (p - 0.55) / 0.45)

  return (
    <section ref={box} id="contact" className="bg-[#f1f1f1] px-4 pt-10 pb-20 sm:pb-28 overflow-hidden" dir={he ? 'rtl' : 'ltr'}>
      <div
        className="max-w-4xl mx-auto bg-burgundy-500 text-white px-5 sm:px-10 py-10 sm:py-14 origin-bottom"
        style={{
          transform: `translateY(${(1 - e) * 80}px) scaleX(${0.3 + 0.7 * e})`,
          borderRadius: `${radius} ${radius} 28px 28px`,
          minHeight: `${160 + 340 * e}px`,
        }}
      >
        <div style={{ opacity: content, transform: `translateY(${(1 - content) * 24}px)` }}>
          <h2 className="text-4xl sm:text-6xl font-bold mb-8">{he ? 'בואו נדבר.' : "Let's talk."}</h2>

          <a href={`tel:${tel}`} className="block rounded-[24px] bg-navy-800 px-6 py-7 sm:px-10 sm:py-9 mb-4 hover:bg-navy-700 transition-colors">
            <span className="block text-sm font-semibold text-burgundy-200 mb-4">{he ? 'התקשרו עכשיו' : 'Call now'}</span>
            <span dir="ltr" className="block text-4xl sm:text-6xl font-light tracking-wide text-start">{PHONE}</span>
          </a>

          <div className="grid grid-cols-2 gap-4">
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="rounded-[24px] bg-white text-navy-800 p-5 sm:p-7 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
              <span className="w-11 h-11 rounded-xl bg-burgundy-50 text-burgundy-500 flex items-center justify-center" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>
              </span>
              <span>
                <span className="block text-xl font-bold">{he ? 'וואטסאפ' : 'WhatsApp'}</span>
                <span className="block text-xs text-navy-400 mt-1">{he ? 'כתבו לנו מתי שנוח' : 'Write to us any time'}</span>
              </span>
            </a>
            <a href={`mailto:${EMAIL}`} className="rounded-[24px] bg-burgundy-700 text-white p-5 sm:p-7 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
              <span className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-bold">{he ? 'מייל' : 'Email'}</span>
                <span dir="ltr" className="block text-xs text-white/80 mt-1 truncate text-start">{EMAIL}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
