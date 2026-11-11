'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'
import { useConfirm } from '@/components/ui/useConfirm'
import { CATEGORY_LABELS, REGION_LABELS, type SpotCategory, type SpotRegion } from '@/types/dateSpots'
import type { DateSpotRow } from '@/lib/dateSpots'

interface Draft {
  name: string
  city: string
  region: SpotRegion
  category: SpotCategory
  vibe: string
  address: string
  google_maps_url: string
  website_url: string
  phone: string
  kosher: '' | 'yes' | 'no'
  price_range: '' | '₪' | '₪₪' | '₪₪₪'
  is_published: boolean
  is_sponsored: boolean
  sponsor_until: string
  admin_notes: string
}

const EMPTY: Draft = {
  name: '', city: '', region: 'jerusalem', category: 'restaurant', vibe: '', address: '',
  google_maps_url: '', website_url: '', phone: '', kosher: '', price_range: '',
  is_published: true, is_sponsored: false, sponsor_until: '', admin_notes: '',
}

const toDraft = (r: DateSpotRow): Draft => ({
  name: r.name, city: r.city, region: r.region, category: r.category, vibe: r.vibe,
  address: r.address ?? '', google_maps_url: r.google_maps_url ?? '', website_url: r.website_url ?? '', phone: r.phone ?? '',
  kosher: r.kosher == null ? '' : r.kosher ? 'yes' : 'no',
  price_range: r.price_range ?? '', is_published: r.is_published, is_sponsored: r.is_sponsored,
  sponsor_until: r.sponsor_until ?? '', admin_notes: r.admin_notes ?? '',
})

const isHttp = (v: string) => /^https?:\/\//i.test(v)

type Filter = 'all' | 'published' | 'hidden' | 'partners'

/** Administrator control of the date spots: add, edit, hide, delete, and mark paid partners. */
export default function DateSpotsAdminPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const { confirm, dialog } = useConfirm(he)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [rows, setRows] = useState<DateSpotRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await (createClient() as any).from('date_spots').select('*').order('created_at', { ascending: false })
    if (err) {
      setError(he ? 'לא ניתן לטעון. ודאו שהרצתם את קובץ ה-SQL של מקומות הדייט.' : 'Could not load. Make sure the date-spots SQL has been run.')
      setRows([])
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }, [he])

  useEffect(() => {
    restoreSession().then((s) => {
      const admin = s?.role === 'admin'
      setIsAdmin(admin)
      if (admin) load()
    })
  }, [load])

  const today = new Date().toISOString().slice(0, 10)
  const isActivePartner = (r: DateSpotRow) => r.is_sponsored && (!r.sponsor_until || r.sponsor_until >= today)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => (filter === 'published' ? r.is_published : filter === 'hidden' ? !r.is_published : filter === 'partners' ? isActivePartner(r) : true))
      .filter((r) => !q || `${r.name} ${r.city} ${r.vibe}`.toLowerCase().includes(q))
      .sort((a, b) => Number(isActivePartner(b)) - Number(isActivePartner(a)) || a.name.localeCompare(b.name, 'he'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, filter, query])

  const startNew = () => {
    setDraft(EMPTY)
    setEditing('new')
    setError('')
    setNotice('')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30)
  }
  const startEdit = (r: DateSpotRow) => {
    setDraft(toDraft(r))
    setEditing(r.id)
    setError('')
    setNotice('')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!draft.name.trim() || !draft.city.trim()) return setError(he ? 'שם ועיר הם שדות חובה.' : 'Name and city are required.')
    if (draft.google_maps_url && !isHttp(draft.google_maps_url)) return setError(he ? 'קישור המפה חייב להתחיל ב-https://' : 'Map link must start with https://')
    if (draft.website_url && !isHttp(draft.website_url)) return setError(he ? 'קישור האתר חייב להתחיל ב-https://' : 'Website link must start with https://')
    const payload = {
      name: draft.name.trim(),
      city: draft.city.trim(),
      region: draft.region,
      category: draft.category,
      vibe: draft.vibe.trim(),
      address: draft.address.trim() || null,
      google_maps_url: draft.google_maps_url.trim() || null,
      website_url: draft.website_url.trim() || null,
      phone: draft.phone.trim() || null,
      kosher: draft.kosher === '' ? null : draft.kosher === 'yes',
      price_range: draft.price_range || null,
      is_published: draft.is_published,
      is_sponsored: draft.is_sponsored,
      sponsor_until: draft.is_sponsored && draft.sponsor_until ? draft.sponsor_until : null,
      admin_notes: draft.admin_notes.trim() || null,
      updated_at: new Date().toISOString(),
    }
    setSaving(true)
    const db = createClient() as any
    const res = editing === 'new'
      ? await db.from('date_spots').insert(payload).select('*').single()
      : await db.from('date_spots').update(payload).eq('id', editing).select('*').single()
    setSaving(false)
    if (res.error || !res.data) {
      setError((he ? 'השמירה נכשלה: ' : 'Saving failed: ') + (res.error?.message ?? ''))
      return
    }
    setRows((list) => (editing === 'new' ? [res.data, ...list] : list.map((x) => (x.id === res.data.id ? res.data : x))))
    setNotice(editing === 'new' ? (he ? 'המקום נוסף.' : 'Spot added.') : he ? 'השינויים נשמרו.' : 'Changes saved.')
    setEditing(null)
  }

  const patchRow = async (r: DateSpotRow, patch: Partial<DateSpotRow>, okMsg: string) => {
    setBusyId(r.id)
    setError('')
    setNotice('')
    const { data, error: err } = await (createClient() as any)
      .from('date_spots').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', r.id).select('*').single()
    setBusyId(null)
    if (err || !data) return setError(he ? 'העדכון נכשל.' : 'Update failed.')
    setRows((list) => list.map((x) => (x.id === r.id ? data : x)))
    setNotice(okMsg)
  }

  const remove = async (r: DateSpotRow) => {
    const ask = he ? `למחוק את "${r.name}" לצמיתות? אפשר גם רק להסתיר אותו. אי אפשר לשחזר מחיקה.` : `Permanently delete "${r.name}"? You can also just hide it. This cannot be undone.`
    if (!(await confirm(ask, { danger: true, confirmLabel: he ? 'מחיקה' : 'Delete' }))) return
    setBusyId(r.id)
    setError('')
    setNotice('')
    const { error: err } = await (createClient() as any).from('date_spots').delete().eq('id', r.id)
    setBusyId(null)
    if (err) return setError(he ? 'המחיקה נכשלה.' : 'Delete failed.')
    setRows((list) => list.filter((x) => x.id !== r.id))
    setNotice(he ? 'המקום נמחק.' : 'Spot deleted.')
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'ניהול מקומות לדייט למנהל המערכת בלבד' : 'Date spots are for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">{he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}</Link>
        </div>
      </div>
    )
  }

  const input = 'w-full rounded-2xl border border-navy-100 bg-white px-4 py-3 text-[15px] text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-400'
  const label = 'text-sm font-semibold text-navy-800'
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const filters: [Filter, string][] = [
    ['all', he ? 'הכל' : 'All'],
    ['published', he ? 'מוצגים' : 'Published'],
    ['hidden', he ? 'מוסתרים' : 'Hidden'],
    ['partners', he ? 'שותפים' : 'Partners'],
  ]

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      {dialog}
      <header className="hero-dark text-white pt-6 pb-4">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-100 hover:text-white">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3">{he ? 'ניהול מקומות לדייט' : 'Manage date spots'}</h1>
          <p className="text-sm text-navy-100 mt-2">
            {he
              ? 'הוספה, עריכה, הסתרה ומחיקה של מקומות. מקום שסומן "שותף" מופיע ראשון עם תג, ואפשר להגדיר עד איזה תאריך.'
              : 'Add, edit, hide and delete spots. A spot marked "Partner" shows first with a badge, optionally until a date.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={startNew} className="h-11 px-6 rounded-full bg-burgundy-400 hover:bg-burgundy-300 text-white text-sm font-bold">
              + {he ? 'הוספת מקום' : 'Add a spot'}
            </button>
            <Link href={`/${locale}/date-spots`} className="h-11 px-6 rounded-full border border-white/30 text-white hover:bg-white/10 text-sm font-medium inline-flex items-center">
              {he ? 'צפייה בעמוד הציבורי' : 'View public page'}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-5">
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {notice && <p className="rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-4" role="status">{notice}</p>}

        {editing && (
          <form onSubmit={save} className="rounded-[28px] bg-white shadow-card p-6 sm:p-8 flex flex-col gap-5">
            <h2 className="text-xl font-bold text-navy-800">{editing === 'new' ? (he ? 'מקום חדש' : 'New spot') : he ? 'עריכת מקום' : 'Edit spot'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'שם המקום *' : 'Name *'}</label>
                <input className={input} value={draft.name} maxLength={120} onChange={(e) => set('name', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'עיר *' : 'City *'}</label>
                <input className={input} value={draft.city} maxLength={80} onChange={(e) => set('city', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'אזור' : 'Region'}</label>
                <select className={input} value={draft.region} onChange={(e) => set('region', e.target.value as SpotRegion)}>
                  {(Object.keys(REGION_LABELS) as SpotRegion[]).map((k) => <option key={k} value={k}>{he ? REGION_LABELS[k].he : REGION_LABELS[k].en}</option>)}
                </select></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'קטגוריה' : 'Category'}</label>
                <select className={input} value={draft.category} onChange={(e) => set('category', e.target.value as SpotCategory)}>
                  {(Object.keys(CATEGORY_LABELS) as SpotCategory[]).map((k) => <option key={k} value={k}>{he ? CATEGORY_LABELS[k].he : CATEGORY_LABELS[k].en}</option>)}
                </select></div>
              <div className="flex flex-col gap-1.5 sm:col-span-2"><label className={label}>{he ? 'תיאור קצר (אווירה)' : 'Short description'}</label>
                <textarea className={`${input} min-h-[90px]`} value={draft.vibe} maxLength={500} onChange={(e) => set('vibe', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'כתובת' : 'Address'}</label>
                <input className={input} value={draft.address} maxLength={200} onChange={(e) => set('address', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'טלפון' : 'Phone'}</label>
                <input className={input} dir="ltr" value={draft.phone} maxLength={30} onChange={(e) => set('phone', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'קישור למפה (https://…)' : 'Map link (https://…)'}</label>
                <input className={input} dir="ltr" value={draft.google_maps_url} maxLength={500} onChange={(e) => set('google_maps_url', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'אתר (https://…)' : 'Website (https://…)'}</label>
                <input className={input} dir="ltr" value={draft.website_url} maxLength={500} onChange={(e) => set('website_url', e.target.value)} /></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'כשרות' : 'Kosher'}</label>
                <select className={input} value={draft.kosher} onChange={(e) => set('kosher', e.target.value as Draft['kosher'])}>
                  <option value="">{he ? 'לא צוין' : 'Not specified'}</option>
                  <option value="yes">{he ? 'כשר' : 'Kosher'}</option>
                  <option value="no">{he ? 'לא כשר' : 'Not kosher'}</option>
                </select></div>
              <div className="flex flex-col gap-1.5"><label className={label}>{he ? 'טווח מחירים' : 'Price range'}</label>
                <select className={input} value={draft.price_range} onChange={(e) => set('price_range', e.target.value as Draft['price_range'])}>
                  <option value="">{he ? 'לא צוין' : 'Not specified'}</option>
                  <option value="₪">₪</option><option value="₪₪">₪₪</option><option value="₪₪₪">₪₪₪</option>
                </select></div>
            </div>

            <div className="rounded-2xl bg-[#f6f6f6] p-5 flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-navy-800 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-burgundy-500" checked={draft.is_published} onChange={(e) => set('is_published', e.target.checked)} />
                {he ? 'מוצג באתר' : 'Visible on the site'}
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-navy-800 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-burgundy-500" checked={draft.is_sponsored} onChange={(e) => set('is_sponsored', e.target.checked)} />
                {he ? 'שותף (בתשלום): מופיע ראשון עם תג "שותף"' : 'Partner (paid): shown first with a "Partner" badge'}
              </label>
              {draft.is_sponsored && (
                <div className="flex flex-col gap-1.5 sm:max-w-xs">
                  <label className={label}>{he ? 'שותף עד תאריך (אופציונלי)' : 'Partner until (optional)'}</label>
                  <input type="date" className={input} dir="ltr" value={draft.sponsor_until} onChange={(e) => set('sponsor_until', e.target.value)} />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className={label}>{he ? 'הערות פנימיות (לא מוצג לציבור): מה סוכם, כמה שולם, איש קשר' : 'Internal notes (never public): terms, amount paid, contact'}</label>
                <textarea className={`${input} min-h-[70px]`} value={draft.admin_notes} maxLength={1000} onChange={(e) => set('admin_notes', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="h-12 px-8 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold">
                {saving ? (he ? 'שומר...' : 'Saving…') : he ? 'שמירה' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="h-12 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold">
                {he ? 'ביטול' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder={he ? 'חיפוש לפי שם, עיר או תיאור' : 'Search by name, city or description'}
            className="flex-1 min-w-[220px] h-11 rounded-full border border-navy-100 bg-white px-5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
          />
          <div className="flex gap-2 flex-wrap">
            {filters.map(([k, t]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`h-10 px-5 rounded-full text-sm font-medium transition-colors ${filter === k ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 hover:bg-navy-50'}`}>
                {t}
              </button>
            ))}
          </div>
          <span className="text-sm text-navy-400">{he ? `${shown.length} מקומות` : `${shown.length} spots`}</span>
        </div>

        {loading && <p className="text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {!loading && !error && shown.length === 0 && (
          <p className="text-center text-gray-400 py-12">{he ? 'אין מקומות להצגה. אפשר להוסיף מקום חדש.' : 'No spots to show. Add a new one.'}</p>
        )}

        <div className="flex flex-col gap-3">
          {shown.map((r) => {
            const cat = CATEGORY_LABELS[r.category]
            return (
              <article key={r.id} className={`rounded-[24px] bg-white shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${r.is_published ? '' : 'opacity-70'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-navy-800">{r.name}</h3>
                    {isActivePartner(r) && <span className="text-[10px] font-bold bg-burgundy-500 text-white rounded-full px-2.5 py-0.5">{he ? 'שותף' : 'Partner'}{r.sponsor_until ? ` · ${r.sponsor_until}` : ''}</span>}
                    {!r.is_published && <span className="text-[10px] font-bold bg-navy-100 text-navy-600 rounded-full px-2.5 py-0.5">{he ? 'מוסתר' : 'Hidden'}</span>}
                    {r.is_sponsored && !isActivePartner(r) && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 rounded-full px-2.5 py-0.5">{he ? 'השותפות פגה' : 'Partnership expired'}</span>}
                  </div>
                  <p className="text-xs text-navy-400 mt-1">{r.city} · {he ? REGION_LABELS[r.region].he : REGION_LABELS[r.region].en} · {he ? cat.he : cat.en}</p>
                  {r.admin_notes && <p className="text-xs text-navy-500 mt-1.5 bg-[#f6f6f6] rounded-xl px-3 py-1.5">{r.admin_notes}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => startEdit(r)} className="h-9 px-4 rounded-full border border-navy-200 text-xs font-semibold text-navy-700 hover:bg-navy-50">{he ? 'עריכה' : 'Edit'}</button>
                  <button disabled={busyId === r.id} onClick={() => patchRow(r, { is_published: !r.is_published }, r.is_published ? (he ? 'המקום הוסתר.' : 'Spot hidden.') : he ? 'המקום מוצג באתר.' : 'Spot is visible.')}
                    className="h-9 px-4 rounded-full border border-navy-200 text-xs font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-60">
                    {r.is_published ? (he ? 'הסתרה' : 'Hide') : he ? 'פרסום' : 'Publish'}
                  </button>
                  <button disabled={busyId === r.id} onClick={() => remove(r)} className="h-9 px-4 rounded-full border border-burgundy-200 text-xs font-semibold text-burgundy-600 hover:bg-burgundy-50 disabled:opacity-60">{he ? 'מחיקה' : 'Delete'}</button>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
