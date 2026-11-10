'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { restoreSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/client'
import { useConfirm } from '@/components/ui/useConfirm'
import { FEMALE_FORM, MALE_FORM, allFields, type RegistrationForm } from '@/constants/registrationForms'
import { registrationToProfileRow } from '@/lib/registration/toProfile'

interface Row {
  id: string
  created_at: string
  answers: Record<string, string>
  photo_path: string
  profile_id: string | null
  user_id: string | null
}

type Gender = 'male' | 'female'

const FORMS: Record<Gender, RegistrationForm> = { male: MALE_FORM, female: FEMALE_FORM }

/** Administrator view of the registration questionnaires submitted through the site. */
export default function RegistrationsPage({ params: { locale } }: { params: { locale: string } }) {
  const he = locale === 'he'
  const { confirm, dialog } = useConfirm(he)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [gender, setGender] = useState<Gender>('male')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async (g: Gender) => {
    setLoading(true)
    setError('')
    const { data, error: err } = await (createClient() as any)
      .from(`${g}_registrations`)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (err) {
      setError(he ? 'לא ניתן לטעון את ההרשמות. ודאו שהרצתם את קבצי ה-SQL של ההרשמות וש-is_admin מוגדר.' : 'Could not load registrations. Make sure the SQL migrations ran and is_admin is set.')
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
      if (admin) load(gender)
    })
  }, [gender, load])

  const toggle = async (r: Row) => {
    const next = open === r.id ? null : r.id
    setOpen(next)
    if (next && !photos[r.id]) {
      const { data } = await createClient().storage.from('registration-photos').createSignedUrl(r.photo_path, 3600)
      if (data?.signedUrl) setPhotos((p) => ({ ...p, [r.id]: data.signedUrl }))
    }
  }

  const addToProfiles = async (r: Row) => {
    if (r.profile_id) return
    const name = `${r.answers.fullName ?? ''} ${r.answers.lastName ?? ''}`.trim()
    const ask = he
      ? `להוסיף את ${name} לפרופילים של השדכנים? הם יראו את הפרטים והטלפון.`
      : `Add ${name} to the matchmakers' profiles? They will see the details and phone.`
    if (!(await confirm(ask, { confirmLabel: he ? 'הוספה לפרופילים' : 'Add' }))) return
    setBusyId(r.id)
    setError('')
    setNotice('')
    const db = createClient() as any
    const row = { ...registrationToProfileRow(gender, r.answers, r.photo_path), matchmaker_status: 'bright_red' }
    const { data, error: insErr } = await db.from('profiles').insert(row).select('id').single()
    if (insErr || !data) {
      setError((he ? 'ההוספה נכשלה: ' : 'Adding failed: ') + (insErr?.message ?? ''))
      setBusyId(null)
      return
    }
    const { error: updErr } = await db.from(`${gender}_registrations`).update({ profile_id: data.id }).eq('id', r.id)
    if (updErr) setError(he ? 'הפרופיל נוצר, אבל לא הצלחנו לסמן את ההרשמה.' : 'Profile created, but the registration could not be marked.')
    else setNotice(he ? 'נוסף לפרופילים של השדכנים.' : 'Added to the matchmakers’ profiles.')
    setRows((list) => list.map((x) => (x.id === r.id ? { ...x, profile_id: data.id } : x)))
    setBusyId(null)
  }

  const removeRegistration = async (r: Row) => {
    const name = `${r.answers.fullName ?? ''} ${r.answers.lastName ?? ''}`.trim()
    const extra = r.profile_id ? (he ? ' גם הפרופיל שנוצר ממנה יימחק.' : ' The profile created from it is deleted too.') : ''
    const ask = (he ? `למחוק את ההרשמה של ${name} לצמיתות, כולל התמונה?` : `Permanently delete ${name}'s registration, including the photo?`)
      + extra + (he ? ' אי אפשר לשחזר.' : ' This cannot be undone.')
    if (!(await confirm(ask, { danger: true, confirmLabel: he ? 'מחיקה' : 'Delete' }))) return
    setBusyId(r.id)
    setError('')
    setNotice('')
    const db = createClient() as any
    if (r.profile_id) {
      const { error: pErr } = await db.from('profiles').delete().eq('id', r.profile_id)
      if (pErr) {
        setError(he ? 'מחיקת הפרופיל נכשלה.' : 'Deleting the profile failed.')
        setBusyId(null)
        return
      }
    }
    const { error: dErr } = await db.from(`${gender}_registrations`).delete().eq('id', r.id)
    if (dErr) {
      setError(he ? 'המחיקה נכשלה.' : 'Delete failed.')
      setBusyId(null)
      return
    }
    await createClient().storage.from('registration-photos').remove([r.photo_path])
    if (r.user_id) {
      // Also remove the candidate's login so the email can register again.
      const { data: sess } = await createClient().auth.getSession()
      const res = await fetch('/api/admin/candidate', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.session?.access_token ?? ''}` },
        body: JSON.stringify({ userId: r.user_id }),
      })
      if (!res.ok) setError(he ? 'ההרשמה נמחקה, אבל ההתחברות של המועמד לא נמחקה.' : 'Registration deleted, but the candidate login was not removed.')
    }
    setRows((list) => list.filter((x) => x.id !== r.id))
    setOpen(null)
    setBusyId(null)
    setNotice(he ? 'ההרשמה נמחקה.' : 'Registration deleted.')
  }

  if (isAdmin === null) return <div className="min-h-[50vh]" />
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir={he ? 'rtl' : 'ltr'}>
        <div className="rounded-[32px] bg-white shadow-card p-10 text-center max-w-md">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-navy-800 mb-2">{he ? 'ההרשמות פתוחות למנהל המערכת בלבד' : 'Registrations are for the system administrator only'}</h1>
          <Link href={`/${locale}/matchmaker`} className="text-sm text-navy-500 underline">{he ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}</Link>
        </div>
      </div>
    )
  }

  const form = FORMS[gender]
  const fields = allFields(form).filter((f) => f.type !== 'file')
  const labelOf = (id: string, label: string) => {
    const m = id.match(/^ref(\d)(Name|Phone)$/)
    return m ? `${label.replace(':', '')} (${he ? 'בירור' : 'reference'} ${m[1]})` : label
  }
  const fmt = (iso: string) => new Date(iso).toLocaleString(he ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="min-h-screen bg-[#f1f1f1]" dir={he ? 'rtl' : 'ltr'}>
      {dialog}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Link href={`/${locale}/matchmaker`} className="text-xs text-navy-400 hover:text-navy-600">{he ? '← לוח הבקרה' : '← Dashboard'}</Link>
            <h1 className="text-xl font-bold text-navy-700 mt-1">{he ? 'הרשמות מהאתר' : 'Website registrations'}</h1>
            <p className="text-sm text-gray-500">{he ? `${rows.length} הרשמות` : `${rows.length} registrations`}</p>
          </div>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} onClick={() => { setGender(g); setOpen(null) }}
                className={`h-10 px-5 rounded-full text-sm font-medium transition-colors ${gender === g ? 'bg-navy-800 text-white' : 'bg-[#f1f1f1] text-navy-700 hover:bg-navy-50'}`}>
                {g === 'male' ? (he ? 'מיועדים' : 'Men') : he ? 'מיועדות' : 'Women'}
              </button>
            ))}
            <button onClick={() => load(gender)} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 hover:bg-navy-50">
              {he ? 'רענון' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-3">
        {loading && <p className="text-center text-gray-400 py-10">{he ? 'טוען...' : 'Loading…'}</p>}
        {notice && <p className="rounded-2xl bg-white shadow-card text-navy-700 text-sm px-5 py-3" role="status">{notice}</p>}
        {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-4" role="alert">{error}</p>}
        {!loading && !error && rows.length === 0 && <p className="text-center text-gray-400 py-16">{he ? 'עדיין אין הרשמות' : 'No registrations yet'}</p>}

        {rows.map((r) => (
          <article key={r.id} className="rounded-[24px] bg-white shadow-card overflow-hidden">
            <button onClick={() => toggle(r)} className="w-full text-start px-6 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-800 truncate">
                  {r.answers.fullName} {r.answers.lastName}
                  {r.profile_id && (
                    <span className="ms-2 text-[10px] bg-navy-800 text-white px-2 py-0.5 rounded-full align-middle">{he ? 'בפרופילים' : 'In profiles'}</span>
                  )}
                </p>
                <p className="text-xs text-navy-400 truncate">{r.answers.age} · {r.answers.city} · {r.answers.community} · {r.answers.phone}</p>
              </div>
              <span className="text-xs text-navy-400 shrink-0">{fmt(r.created_at)}</span>
            </button>

            {open === r.id && (
              <div className="px-6 pb-6 border-t border-navy-50 pt-4 flex flex-col gap-4">
                <div className="flex gap-2 flex-wrap">
                  <a href={`tel:${(r.answers.phone ?? '').replace(/[^+\d]/g, '')}`} className="h-10 px-5 rounded-full bg-navy-800 text-white text-sm font-semibold inline-flex items-center hover:bg-navy-700">{he ? 'התקשרות' : 'Call'}</a>
                  <a href={`mailto:${r.answers.email}`} className="h-10 px-5 rounded-full border border-navy-200 text-sm text-navy-700 inline-flex items-center hover:bg-navy-50">{he ? 'מייל' : 'Email'}</a>
                  {r.profile_id ? (
                    <Link
                      href={`/${locale}/matchmaker/profiles/${r.profile_id}`}
                      className="h-10 px-5 rounded-full bg-navy-50 text-navy-800 text-sm font-semibold inline-flex items-center hover:bg-navy-100"
                    >
                      ✓ {he ? 'נוסף לפרופילים · לפתיחה' : 'In profiles · open'}
                    </Link>
                  ) : (
                    <button
                      onClick={() => addToProfiles(r)}
                      disabled={busyId === r.id}
                      className="h-10 px-5 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-semibold"
                    >
                      {he ? 'הוסף לפרופילים' : 'Add to profiles'}
                    </button>
                  )}
                  <button
                    onClick={() => removeRegistration(r)}
                    disabled={busyId === r.id}
                    className="h-10 px-5 rounded-full text-sm text-burgundy-500 hover:bg-burgundy-50 ms-auto disabled:opacity-60"
                  >
                    {he ? 'מחיקה' : 'Delete'}
                  </button>
                </div>
                {photos[r.id] && (
                  // Signed URL from private storage; next/image would need the host allow-listed.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[r.id]} alt="" className="max-h-72 rounded-2xl object-contain self-start bg-[#f1f1f1]" />
                )}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {fields.map((f) =>
                    r.answers[f.id] ? (
                      <div key={f.id}>
                        <dt className="text-xs font-semibold text-navy-400">{labelOf(f.id, f.label)}</dt>
                        <dd className="text-navy-800 whitespace-pre-wrap break-words">{r.answers[f.id]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  )
}
