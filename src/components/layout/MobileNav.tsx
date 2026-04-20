'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

interface MobileNavProps {
  locale: string
}

export function MobileNav({ locale }: MobileNavProps) {
  const [isOpen, setIsOpen]   = useState(false)
  const [mounted, setMounted] = useState(false)
  const isHe = locale === 'he'

  // Portal requires the DOM to be available
  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const close = () => setIsOpen(false)

  const navLinks = [
    { href: `/${locale}`,          label: isHe ? 'דף הבית'   : 'Home' },
    { href: `/${locale}/personal`, label: isHe ? 'אזור אישי' : 'Personal Area' },
    { href: `/${locale}/contact`,  label: isHe ? 'צור קשר'   : 'Contact Us' },
    { href: `/${locale}/about`,    label: isHe ? 'אודות'      : 'About Us' },
    { href: `/${locale}/terms`,    label: isHe ? 'תקנון'      : 'Terms of Use' },
  ]

  const overlay = (
    <>
      {/* Dark backdrop — covers entire screen */}
      <div
        className="fixed inset-0 bg-black/60"
        style={{ zIndex: 9998 }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isHe ? 'תפריט ניווט' : 'Navigation menu'}
        dir={isHe ? 'rtl' : 'ltr'}
        style={{ zIndex: 9999 }}
        className={`
          fixed top-0 h-screen w-[80vw] max-w-[320px]
          bg-white flex flex-col
          ${isHe ? 'right-0 shadow-[-8px_0_30px_rgba(0,0,0,0.15)]'
                  : 'left-0  shadow-[8px_0_30px_rgba(0,0,0,0.15)]'}
        `}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-navy-700 shrink-0">
          <span className="text-base font-bold text-white tracking-wide">
            {isHe ? 'תפריט' : 'Menu'}
          </span>
          <button
            onClick={close}
            aria-label={isHe ? 'סגור תפריט' : 'Close menu'}
            className="w-9 h-9 flex items-center justify-center rounded-lg
              text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col flex-1 overflow-y-auto py-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center justify-between px-6 py-5
                text-right text-[17px] font-medium text-gray-800
                border-b border-gray-100 last:border-b-0
                hover:bg-navy-50 hover:text-navy-700 active:bg-navy-100
                transition-colors duration-150"
            >
              <span>{label}</span>
              {/* Chevron pointing inward (left for RTL, right for LTR) */}
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d={isHe ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger trigger — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={isHe ? 'פתח תפריט' : 'Open menu'}
        className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px]
          rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="block w-[22px] h-[2px] bg-gray-700 rounded-full" />
        <span className="block w-[22px] h-[2px] bg-gray-700 rounded-full" />
        <span className="block w-[22px] h-[2px] bg-gray-700 rounded-full" />
      </button>

      {/* Portal — renders at <body> level, bypasses all parent stacking contexts */}
      {mounted && isOpen && createPortal(overlay, document.body)}
    </>
  )
}
