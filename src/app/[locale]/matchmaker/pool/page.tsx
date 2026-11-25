'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TallyRegistrationForm } from '@/components/forms/TallyRegistrationForm'
import { FEMALE_FORM, MALE_FORM, type RegistrationForm, type TallyField } from '@/constants/registrationForms'

interface Entry {
  id: string
  gender: 'male' | 'female'
  name: string
  age: number | null
  city: string
  community: string
  enteredBy: string
  notes: string
  photoUrl: string | null
  inMatch: boolean
}
interface Suggestion { id: string; name: string; age: number; city: string; community: string; score: number; highlights: string[]; conflicts: string[] }

const ENTERED_BY = ['אני בעצמי', 'קרוב/ה של המועמד/ת', 'אחר']

/** The short registration form, with the photo and email optional, and two extra questions for the pool. */
function poolForm(base: RegistrationForm): RegistrationForm {
  const pages = base.pages.map((pg) => ({ ...pg, fields: pg.fields.map((f) => (f.id === 'photo' || f.id === 'email' ? { ...f, required: false } : f)) }))
  const lastRegister = pages.map((pg, i) => ({ pg, i })).filter((x) => x.pg.stage === 'register').pop()
  if (lastRegister) {
    const extra: TallyField[] = [
      { id: 'enteredBy', label: 'מי הכניס את הפרטים?', type: 'select', required: true, options: ENTERED_BY, noOther: true },
      { id: 'poolNotes', label: 'רזומה והערות (לא חובה)', hint: 'אפשר להדביק כאן את הרזומה או כל מידע שחשוב לך לשמור.', type: 'textarea', required: false },
    ]
    pages[lastRegister.i] = { ...lastRegister.pg, fields: [...lastRegister.pg.fields, ...extra] }
  }
  return { ...base, pages }
}

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` } })
}

export default function PoolPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState<'male' | 'female' | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sugg, setSugg] = useState<Record<string, Suggestion[] | 'loading'>>({})
  const [notice, setNotice] = useState('')

  const male = useMemo(() => poolForm(MALE_FORM), [])
  const female = useMemo(() => poolForm(FEMALE_FORM), [])

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/matchmaker/pool')
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.message ?? 'bad')
      setEntries(json.entries ?? [])
    } catch (e) {
      setError(e instanceof Error && e.message !== 'bad' ? e.message : 'לא ניתן לטעון את המאגר.')
    }
  }, [])
  useEffect(() => { load() }, [load])

  const showSuggestions = async (id: string) => {
    if (openId === id) { setOpenId(null); return }
    setOpenId(id)
    setSugg((s) => ({ ...s, [id]: 'loading' }))
    const res = await authed(`/api/matchmaker/pool/suggest?id=${id}`)
    const json = await res.json().catch(() => ({}))
    setSugg((s) => ({ ...s, [id]: res.ok ? json.suggestions ?? [] : [] }))
  }

  const openMatch = async (poolId: string, otherProfileId: string, name: string) => {
    if (!window.confirm(`לפתוח את השידוך עם ${name}? המועמד/ת מהמאגר יעלה/תעלה לאתר ויינעל/תינעל לשידוך הזה.`)) return
    setNotice('')
    const res = await authed('/api/matchmaker/pool/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poolId, otherProfileId }) })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setNotice(json?.message ?? 'הפתיחה נכשלה.'); return }
    setNotice('השידוך נפתח. הוא מופיע במעקב ההתקדמות בלוח, ושם אפשר לשלוח דמי שידוך.')
    setOpenId(null)
    load()
  }

  const remove = async (e: Entry) => {
    if (!window.confirm(`למחוק את ${e.name || 'הכרטיס'} מהמאגר? אי אפשר לשחזר.`)) return
    const res = await authed(`/api/matchmaker/pool?id=${e.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) { setNotice(json?.message ?? 'המחיקה נכשלה.'); return }
    load()
  }

  const btn = 'h-11 px-6 rounded-full text-sm font-bold transition-colors'

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      <div className="hero-dark text-white px-4 py-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">המאגר האישי שלי</h1>
        <p className="text-navy-100 max-w-2xl mx-auto">
          מקום פרטי לאחסון מיועדים ומיועדות שלך. הם לא מופיעים באתר ולא בעוזר החכם, ואף שדכן אחר ואפילו המנהל לא רואים אותם. כשיש התאמה באתר, אפשר לפתוח אותם לאתר ולהתחיל שידוך.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3">
            <button type="button" onClick={() => { setAdding('male'); setNotice('') }} className={`${btn} bg-navy-800 hover:bg-navy-700 text-white`}>הוספת מיועד</button>
            <button type="button" onClick={() => { setAdding('female'); setNotice('') }} className={`${btn} bg-burgundy-500 hover:bg-burgundy-600 text-white`}>הוספת מיועדת</button>
          </div>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-600 underline">← חזרה ללוח</Link>
        </div>

        {notice && <p className="rounded-2xl bg-white shadow-card text-navy-700 text-sm px-5 py-4" role="status">{notice}</p>}
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}

        {adding && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-800">{adding === 'male' ? 'מיועד חדש במאגר' : 'מיועדת חדשה במאגר'}</h2>
              <button type="button" onClick={() => setAdding(null)} className="text-sm text-navy-500 underline">ביטול</button>
            </div>
            <TallyRegistrationForm
              key={adding}
              form={adding === 'male' ? male : female}
              endpoint={`/api/matchmaker/pool?gender=${adding}`}
              mode="pool"
              onSaved={() => { setAdding(null); setNotice('נשמר במאגר האישי שלך.'); load() }}
              onCancel={() => setAdding(null)}
            />
          </div>
        )}

        {!adding && entries === null && !error && <p className="text-center text-navy-400 py-10">טוען...</p>}
        {!adding && entries && entries.length === 0 && (
          <p className="rounded-[28px] bg-white shadow-card p-8 text-center text-navy-500">המאגר ריק. אפשר להוסיף מיועד או מיועדת בכפתורים למעלה.</p>
        )}

        {!adding && entries?.map((e) => {
          const list = sugg[e.id]
          return (
            <article key={e.id} className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                {e.photoUrl
                  ? <img src={e.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  : <span className="w-16 h-16 shrink-0 rounded-2xl bg-navy-800 text-white flex items-center justify-center text-2xl font-light">{(e.name || '?').charAt(0)}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-navy-800">{e.name || 'ללא שם'}{e.age ? ` · ${e.gender === 'female' ? 'בת' : 'בן'} ${e.age}` : ''}</p>
                  <p className="text-sm text-navy-500">{[e.city, e.community].filter(Boolean).join(' · ')}</p>
                  <p className="text-xs text-navy-400 mt-0.5">הוכנס על ידי: {e.enteredBy || '-'}</p>
                </div>
                {e.inMatch && <span className="rounded-full bg-burgundy-50 text-burgundy-600 text-xs font-semibold px-3 py-1 shrink-0">באמצע שידוך</span>}
              </div>
              {e.notes && <p className="text-sm text-navy-600 whitespace-pre-wrap rounded-2xl bg-[#f1f1f1] px-4 py-3">{e.notes}</p>}

              {!e.inMatch && (
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => showSuggestions(e.id)} className={`${btn} bg-navy-800 hover:bg-navy-700 text-white`}>
                    {openId === e.id ? 'סגירת ההצעות' : 'הצעות מהאתר'}
                  </button>
                  <button type="button" onClick={() => remove(e)} className={`${btn} border border-navy-200 text-navy-600 hover:bg-navy-50`}>מחיקה</button>
                </div>
              )}

              {openId === e.id && (
                <div className="flex flex-col gap-2">
                  {list === 'loading' && <p className="text-sm text-navy-400">מחפשים התאמות...</p>}
                  {Array.isArray(list) && list.length === 0 && <p className="text-sm text-navy-500">לא נמצאו כרגע פרופילים פנויים שמתאימים באתר.</p>}
                  {Array.isArray(list) && list.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-navy-100 px-4 py-3 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy-800">{s.name} · {s.age}</p>
                          <p className="text-xs text-navy-500">{[s.city, s.community].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="text-xl font-light text-burgundy-500 tabular-nums" dir="ltr">{s.score}%</span>
                      </div>
                      {s.highlights.length > 0 && <p className="text-xs text-navy-600">{s.highlights.slice(0, 3).join(' · ')}</p>}
                      {s.conflicts.length > 0 && <p className="text-xs text-navy-400">שווה לברר: {s.conflicts.slice(0, 2).join(' · ')}</p>}
                      <button type="button" onClick={() => openMatch(e.id, s.id, s.name)} className={`${btn} self-start bg-burgundy-500 hover:bg-burgundy-600 text-white h-10`}>
                        פתיחה לאתר ושידוך
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
