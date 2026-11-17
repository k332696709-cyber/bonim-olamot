/**
 * Keeps a half-filled form in the browser, so a refresh, a closed tab or a trip to Google and back
 * does not lose what was typed. Passwords are never stored. The registration draft lives on the
 * device for a week (photos too, already shrunk); drafts of a signed-in questionnaire or profile
 * edit only live for the open tab, because those are also saved on the server as the person goes.
 */

const TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface Draft {
  values: Record<string, string>
  page: number
  savedAt: number
}

const store = (persistent: boolean): Storage | null => {
  try {
    return persistent ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function loadDraft(key: string, persistent: boolean): Draft | null {
  try {
    const raw = store(persistent)?.getItem(key)
    if (!raw) return null
    const d = JSON.parse(raw) as Draft
    if (!d || typeof d.savedAt !== 'number' || Date.now() - d.savedAt > TTL_MS) {
      store(persistent)?.removeItem(key)
      return null
    }
    return d
  } catch {
    return null
  }
}

export function saveDraft(key: string, persistent: boolean, draft: Draft) {
  try {
    store(persistent)?.setItem(key, JSON.stringify(draft))
  } catch {
    /* storage full or blocked: the form still works, it just cannot be restored */
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// ── photos (IndexedDB) ───────────────────────────────────────────────────────

const DB = 'bonim-drafts'
const STORE = 'photos'

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function savePhotos(key: string, files: File[]) {
  const db = await open()
  if (!db) return
  try {
    const tx = db.transaction(STORE, 'readwrite')
    if (files.length === 0) tx.objectStore(STORE).delete(key)
    else tx.objectStore(STORE).put({ savedAt: Date.now(), files: files.map((f) => ({ name: f.name, type: f.type, blob: f as Blob })) }, key)
  } catch {
    /* ignore */
  }
}

export async function loadPhotos(key: string): Promise<File[]> {
  const db = await open()
  if (!db) return []
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
      req.onsuccess = () => {
        const v = req.result as { savedAt: number; files: { name: string; type: string; blob: Blob }[] } | undefined
        if (!v || Date.now() - v.savedAt > TTL_MS) return resolve([])
        resolve(v.files.map((f) => new File([f.blob], f.name, { type: f.type })))
      }
      req.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

export async function clearPhotos(key: string) {
  const db = await open()
  if (!db) return
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key)
  } catch {
    /* ignore */
  }
}
