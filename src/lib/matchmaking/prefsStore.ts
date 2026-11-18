import type { Prefs } from '@/lib/matchmaking/assistant'

// The smart assistant only refines the suggestions. Its filters are kept in this browser so the
// suggestion list in the personal area can apply them.
const KEY = 'bonim-assistant-prefs'

export function loadPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Prefs) : {}
  } catch {
    return {}
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    if (Object.keys(prefs).length === 0) window.localStorage.removeItem(KEY)
    else window.localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch { /* storage unavailable: the filter just does not persist */ }
}
