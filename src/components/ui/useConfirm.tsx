'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface ConfirmOptions {
  confirmLabel?: string
  cancelLabel?: string
  /** Red confirm button, for deletions. */
  danger?: boolean
}

/**
 * In-page confirmation dialog. Replaces the browser's window.confirm, which some embedded
 * browsers and phones silently ignore (making delete/approve buttons look broken).
 *
 *   const { confirm, dialog } = useConfirm(he)
 *   if (!(await confirm('Delete?', { danger: true }))) return
 *   ...render {dialog} once in the page.
 */
export function useConfirm(he: boolean): { confirm: (message: string, opts?: ConfirmOptions) => Promise<boolean>; dialog: ReactNode } {
  const [state, setState] = useState<{ message: string; opts: ConfirmOptions } | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const close = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setState(null)
  }, [])

  const confirm = useCallback(
    (message: string, opts: ConfirmOptions = {}) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false)
        resolver.current = resolve
        setState({ message, opts })
      }),
    [],
  )

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, close])

  const dialog = state ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => close(false)}
    >
      <div
        dir={he ? 'rtl' : 'ltr'}
        className="w-full max-w-md rounded-[28px] bg-white shadow-luxury p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-navy-800 text-[15px] leading-relaxed whitespace-pre-line">{state.message}</p>
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => close(false)}
            className="h-11 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold"
          >
            {state.opts.cancelLabel ?? (he ? 'ביטול' : 'Cancel')}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className={`h-11 px-6 rounded-full text-white text-sm font-bold ${
              state.opts.danger ? 'bg-burgundy-500 hover:bg-burgundy-600' : 'bg-navy-800 hover:bg-navy-700'
            }`}
          >
            {state.opts.confirmLabel ?? (he ? 'אישור' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, dialog }
}
