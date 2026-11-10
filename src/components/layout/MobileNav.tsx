'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { SmartNavLink } from './SmartNavLink'
import { AuthButton } from './AuthButton'

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
        className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm"
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
          fixed top-3 bottom-3 w-[84vw] max-w-[340px]
          bg-navy-800 text-[#f1f1f1] flex flex-col rounded-[32px] overflow-hidden
          ${isHe ? 'right-3 shadow-[-8px_0_40px_rgba(0,0,0,0.35)]'
                  : 'left-3  shadow-[8px_0_40px_rgba(0,0,0,0.35)]'}
        `}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
          <span className="text-sm font-semibold tracking-widest text-burgundy-300">
            {isHe ? 'תפריט' : 'MENU'}
          </span>
          <button
            onClick={close}
            aria-label={isHe ? 'סגור תפריט' : 'Close menu'}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10
              text-white hover:bg-white/20 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col flex-1 overflow-y-auto px-4 py-3 gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex items-center justify-between px-5 py-4 rounded-full
                text-[20px] font-light text-white
                hover:bg-white/10 active:bg-white/15
                transition-colors duration-150"
            >
              <span>{label}</span>
              <svg
                className="w-4 h-4 text-burgundy-300 shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d={isHe ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
              </svg>
            </Link>
          ))}
          <SmartNavLink
            locale={locale}
            onClick={close}
            className="flex items-center justify-between px-5 py-4 rounded-full text-[20px] font-medium text-white bg-burgundy-500"
          />
        </nav>

        {/* Sign in / "My area" */}
        <div className="p-4 shrink-0">
          <AuthButton
            locale={locale}
            onClick={close}
            fallbackLabel={isHe ? 'כניסה' : 'Sign in'}
            className="flex h-14 items-center justify-center rounded-full bg-burgundy-400 text-white
              text-lg font-bold glow-burgundy"
          />
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger trigger — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={isHe ? 'פתח תפריט' : 'Open menu'}
        className="md:hidden w-11 h-11 flex flex-col justify-center items-center gap-[5px]
          rounded-full bg-navy-800 hover:bg-navy-700 transition-colors"
      >
        <span className="block w-[18px] h-[2px] bg-white rounded-full" />
        <span className="block w-[18px] h-[2px] bg-white rounded-full" />
        <span className="block w-[18px] h-[2px] bg-white rounded-full" />
      </button>

      {/* Portal — renders at <body> level, bypasses all parent stacking contexts */}
      {mounted && isOpen && createPortal(overlay, document.body)}
    </>
  )
}
