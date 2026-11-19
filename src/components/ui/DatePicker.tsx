'use client'

import { useEffect, useState } from 'react'

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

const daysIn = (year: number, month: number) => new Date(year || 2000, month, 0).getDate()

/**
 * A date as three short lists: day, month and year. The year list is the quick way to reach an old
 * year, which a calendar makes slow. The value is "YYYY-MM-DD", or "" until all three are chosen.
 */
export function DatePicker({
  value, onChange, years, id, className = '', invalid,
}: {
  value: string
  onChange: (iso: string) => void
  /** The years to offer, in the order to show them. */
  years: number[]
  id?: string
  className?: string
  invalid?: boolean
}) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const [d, setD] = useState(m ? String(Number(m[3])) : '')
  const [mo, setMo] = useState(m ? String(Number(m[2])) : '')
  const [y, setY] = useState(m ? m[1] : '')

  // A value set from outside (a saved draft, for example) replaces the parts.
  useEffect(() => {
    const mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (mm) { setD(String(Number(mm[3]))); setMo(String(Number(mm[2]))); setY(mm[1]) }
  }, [value])

  const push = (nd: string, nmo: string, ny: string) => {
    if (!nd || !nmo || !ny) return onChange('')
    const day = Math.min(Number(nd), daysIn(Number(ny), Number(nmo)))
    onChange(`${ny}-${String(Number(nmo)).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }

  const maxDay = mo ? daysIn(Number(y), Number(mo)) : 31
  const sel = `h-12 rounded-2xl border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 ${invalid ? 'border-burgundy-400' : 'border-navy-100'} ${className}`

  return (
    <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-2" role="group" aria-label="תאריך">
      <select id={id} aria-label="יום" className={sel} value={d} onChange={(e) => { setD(e.target.value); push(e.target.value, mo, y) }}>
        <option value="">יום</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <select aria-label="חודש" className={sel} value={mo} onChange={(e) => { setMo(e.target.value); push(d, e.target.value, y) }}>
        <option value="">חודש</option>
        {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
      </select>
      <select aria-label="שנה" className={sel} value={y} onChange={(e) => { setY(e.target.value); push(d, mo, e.target.value) }}>
        <option value="">שנה</option>
        {years.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  )
}
