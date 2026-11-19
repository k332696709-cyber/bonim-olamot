'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export type AppTab = 'matches' | 'received' | 'me'

const ICONS: Record<AppTab, JSX.Element> = {
  matches: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </svg>
  ),
  received: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13" />
      <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5l-1.5 2.5h-5L8 13H3z" />
    </svg>
  ),
  me: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
}

/**
 * A signed-in candidate's app: a full-screen view over the public site, with three tabs at the
 * bottom: the smart assistant's matches, the proposals received from a matchmaker, and the
 * personal area.
 */
export function AppShell({
  he, locale, tab, onTab, children,
}: { he: boolean; locale: string; tab: AppTab; onTab: (t: AppTab) => void; children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [tab])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const tabs: { id: AppTab; he: string; en: string }[] = [
    { id: 'matches', he: 'התאמות העוזר החכם', en: 'Smart matches' },
    { id: 'received', he: 'ההצעות שקיבלתי', en: 'Received' },
    { id: 'me', he: 'האזור האישי', en: 'My area' },
  ]
  const title = tabs.find((t) => t.id === tab)!

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <header className="shrink-0 bg-white border-b border-navy-50 px-4 h-14 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-navy-800 truncate">{he ? title.he : title.en}</h1>
        <Link href={`/${locale}`} className="text-sm font-semibold text-navy-500 hover:text-navy-800 shrink-0">
          {he ? 'לאתר' : 'Site'}
        </Link>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 pb-8">{children}</div>
      </div>

      <nav className="shrink-0 bg-white border-t border-navy-100 pb-[env(safe-area-inset-bottom)]" aria-label={he ? 'ניווט' : 'Navigation'}>
        <ul className="max-w-2xl mx-auto grid grid-cols-3">
          {tabs.map((t) => {
            const on = t.id === tab
            return (
              <li key={t.id}>
                <button
                  type="button" onClick={() => onTab(t.id)} aria-current={on ? 'page' : undefined}
                  className={`w-full flex flex-col items-center gap-1 py-2.5 text-[11px] sm:text-xs font-semibold transition-colors ${on ? 'text-burgundy-500' : 'text-navy-400 hover:text-navy-700'}`}
                >
                  {ICONS[t.id]}
                  <span>{he ? t.he : t.en}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
