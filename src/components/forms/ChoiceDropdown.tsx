'use client'

import { useEffect, useRef, useState } from 'react'
import { CHOICE_SEP, OTHER, parseChoices } from '@/constants/registrationForms'

const isOther = (x: string) => x === OTHER || x.startsWith(OTHER + ': ')

/**
 * A compact choice field for long lists: a single line that opens a list. One choice closes it;
 * several choices stay open until closed. With `search` there is a search box, and with `custom`
 * the person can also add an entry of their own. What was chosen is shown as small tags, so the
 * form is not a wall of boxes. The stored answer has the same format as the chip version.
 */
export function ChoiceDropdown({
  id, options, value, onChange, multi = false, custom = false, search = false, max, hasError = false, placeholder = 'בחרו...',
}: {
  id: string
  options: string[]
  value: string
  onChange: (next: string) => void
  multi?: boolean
  custom?: boolean
  search?: boolean
  max?: number
  hasError?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [otherDraft, setOtherDraft] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)

  const chosen = parseChoices(value)
  const otherItem = custom ? undefined : chosen.find(isOther)
  const listed = custom ? options : options.includes(OTHER) ? options : [...options, OTHER]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const write = (items: string[]) => onChange(items.join(CHOICE_SEP))

  const has = (o: string) => (o === OTHER ? chosen.some(isOther) : chosen.includes(o))

  const toggle = (o: string) => {
    if (multi) {
      const next = has(o) ? chosen.filter((x) => (o === OTHER ? !isOther(x) : x !== o)) : [...chosen, o]
      if (max && next.length > max) return
      write(next)
    } else {
      write(has(o) ? [] : [o])
      if (o !== OTHER) setOpen(false)
    }
  }

  const remove = (item: string) => write(chosen.filter((x) => x !== item))

  const addOwn = () => {
    const text = q.replace(/\|/g, '/').trim()
    if (!text || chosen.includes(text) || (max && chosen.length >= max)) return
    write(multi ? [...chosen, text] : [text])
    setQ('')
    if (!multi) setOpen(false)
  }

  const setOtherText = (text: string) => {
    setOtherDraft(text)
    const clean = text.replace(/\|/g, '/').trim()
    const rest = chosen.filter((x) => !isOther(x))
    write([...(multi ? rest : []), clean ? `${OTHER}: ${clean}` : OTHER])
  }

  const shown = q.trim() ? listed.filter((o) => o.includes(q.trim())) : listed
  const exact = q.trim() && listed.some((o) => o === q.trim())
  const label = chosen.length === 0 ? placeholder : multi ? `${chosen.length} נבחרו` : chosen[0]

  return (
    <div ref={box} className="flex flex-col gap-2" id={id}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-[15px] flex items-center justify-between gap-3 text-start transition-colors
          ${hasError ? 'border-burgundy-400' : 'border-navy-100 hover:border-navy-300'} ${chosen.length === 0 ? 'text-navy-300' : 'text-navy-800'}`}
      >
        <span className="truncate">{label}</span>
        <svg className={`w-4 h-4 shrink-0 text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="rounded-2xl border border-navy-100 bg-white shadow-card overflow-hidden">
          {(search || custom) && (
            <div className="p-2 border-b border-navy-50">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (custom && q.trim() && !exact) addOwn() } }}
                maxLength={60}
                placeholder={custom ? 'חיפוש, או הקלידו והוסיפו משלכם' : 'חיפוש'}
                className="w-full rounded-xl border border-navy-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
                aria-label="חיפוש"
                autoFocus
              />
            </div>
          )}
          <ul role="listbox" aria-multiselectable={multi} className="max-h-64 overflow-y-auto py-1">
            {custom && q.trim() && !exact && (
              <li>
                <button type="button" onClick={addOwn} className="w-full text-start px-4 py-2.5 text-sm font-semibold text-burgundy-600 hover:bg-navy-50">
                  {`הוספת "${q.trim()}"`}
                </button>
              </li>
            )}
            {shown.map((o) => {
              const on = has(o)
              return (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggle(o)}
                    className={`w-full text-start px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-navy-50 ${on ? 'bg-navy-50 text-navy-800 font-semibold' : 'text-navy-700'}`}
                  >
                    <span className={`w-5 h-5 shrink-0 border flex items-center justify-center text-[11px] text-white ${multi ? 'rounded-md' : 'rounded-full'} ${on ? 'bg-burgundy-500 border-burgundy-500' : 'border-navy-200 bg-white'}`}>
                      {on ? '✓' : ''}
                    </span>
                    {o}
                  </button>
                </li>
              )
            })}
            {shown.length === 0 && !(custom && q.trim()) && <li className="px-4 py-3 text-sm text-navy-400">לא נמצא</li>}
          </ul>
          {multi && (
            <div className="p-2 border-t border-navy-50 flex justify-between items-center">
              <span className="text-xs text-navy-400">{chosen.length > 0 ? `${chosen.length} נבחרו` : 'אפשר לבחור כמה'}</span>
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-5 rounded-full bg-navy-800 text-white text-sm font-semibold">סגירה</button>
            </div>
          )}
        </div>
      )}

      {multi && chosen.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chosen.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 text-navy-700 text-xs ps-3 pe-1.5 py-1">
              {item}
              <button type="button" onClick={() => remove(item)} aria-label={`הסרת ${item}`} className="w-5 h-5 rounded-full bg-white text-navy-500 hover:text-burgundy-600 text-xs leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {otherItem && (
        <input
          type="text"
          value={otherDraft ?? (otherItem.startsWith(OTHER + ': ') ? otherItem.slice(OTHER.length + 2) : '')}
          onChange={(e) => setOtherText(e.target.value)}
          maxLength={120}
          placeholder="פרטו (לא חובה)"
          aria-label="פירוט עבור אחר"
          className="w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-navy-400"
        />
      )}
    </div>
  )
}
