'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'

interface MobileNavProps {
  locale: string
}

export function MobileNav({ locale }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isHe = locale === 'he'

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const navLinks = [
    { href: `/${locale}`,          label: isHe ? 'דף הבית'   : 'Home' },
    { href: `/${locale}/personal`, label: isHe ? 'אזור אישי' : 'Personal Area' },
    { href: `/${locale}/contact`,  label: isHe ? 'צור קשר'   : 'Contact Us' },
    { href: `/${locale}/about`,    label: isHe ? 'אודות'      : 'About Us' },
    { href: `/${locale}/terms`,    label: isHe ? 'תקנון'      : 'Terms of Use' },
  ]

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors gap-1"
        aria-label={isHe ? 'פתח תפריט' : 'Open menu'}
      >
        <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
        <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
        <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 h-full w-72 bg-white z-50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isHe ? 'right-0' : 'left-0'}
          ${isOpen
            ? 'translate-x-0'
            : isHe ? 'translate-x-full' : '-translate-x-full'
          }
        `}
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href={`/${locale}`} onClick={() => setIsOpen(false)}>
            <Logo size="sm" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100
              transition-colors text-gray-500 text-lg font-light"
            aria-label={isHe ? 'סגור תפריט' : 'Close menu'}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-6 py-4 text-base font-medium text-gray-700
                hover:bg-navy-50 hover:text-navy-700 transition-colors
                border-b border-gray-50 last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
