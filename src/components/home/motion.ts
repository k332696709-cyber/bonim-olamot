'use client'

import { useEffect, useState, type RefObject } from 'react'
import { prefersReducedMotion } from './useInView'

/** Cycles 0..count-1 every `ms` while `active`. */
export function useCycle(active: boolean, count: number, ms: number) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    const t = setInterval(() => setI((x) => (x + 1) % count), ms)
    return () => clearInterval(t)
  }, [active, count, ms])
  return i
}

/** Types `text` one character at a time once `active`, restarting every `restartMs`. */
export function useTyping(text: string, active: boolean, speed = 70, restartMs = 4500) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) { setN(text.length); return }
    let alive = true
    let t: ReturnType<typeof setTimeout>
    const run = () => {
      setN(0)
      let k = 0
      const tick = () => {
        if (!alive) return
        k++
        setN(k)
        t = setTimeout(k < text.length ? tick : run, k < text.length ? speed : restartMs)
      }
      t = setTimeout(tick, 500)
    }
    run()
    return () => { alive = false; clearTimeout(t) }
  }, [text, active, speed, restartMs])
  return text.slice(0, n)
}

/**
 * For a column of `position: sticky` cards marked with `data-stack`: while the next card slides
 * over a card, that card shrinks and dims a little (the stacked-pages effect).
 */
export function useStackScale(listRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = listRef.current
    if (!root || prefersReducedMotion()) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-stack]'))
    let raf = 0
    const update = () => {
      raf = 0
      els.forEach((el, i) => {
        const next = els[i + 1]
        if (!next) return
        const top = el.getBoundingClientRect().top
        const nextTop = next.getBoundingClientRect().top
        const gap = Math.max(0, Math.min(1, 1 - (nextTop - top) / el.offsetHeight))
        el.style.transform = `scale(${1 - gap * 0.05})`
        el.style.filter = `brightness(${1 - gap * 0.12})`
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [listRef])
}
