'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProposalDetailModal } from '@/components/smart-match/ProposalDetailModal'
import { DateIdeasModal } from '@/components/smart-match/DateIdeasModal'

interface MatchmakerCard {
  name: string; city: string; biography: string; specialties: string[]
  languages: string; yearsExperience: number | null; matchesClosed: number | null
}
interface Received {
  matchId: string; stage: string; updatedAt: string; mutual: boolean
  other: { id: string; name: string; age: number | null; city: string; community: string; occupation: string; style: string; gender: 'male' | 'female' }
  matchmaker: MatchmakerCard | null
  coMatchmaker: MatchmakerCard | null
  fee: { amount: number; sentAt: string; acknowledged: boolean } | null
}

const STAGE_HE: Record<string, string> = {
  checking: 'בבירורים',
  proposal_sent: 'ההצעה נשלחה',
  meeting_1: 'פגישה ראשונה',
  meeting_2: 'פגישה שנייה',
  more_meetings: 'המשך פגישות',
  closing: 'סגירת ווארט',
}

async function authed(path: string, init: RequestInit = {}) {
  const { data } = await createClient().auth.getSession()
  return fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}), Authorization: `Bearer ${data.session?.access_token ?? ''}` },
  })
}

function MatchmakerInfo({ m, title }: { m: MatchmakerCard; title: string }) {
  return (
    <div className="rounded-2xl bg-navy-50 px-5 py-4 flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-navy-400">{title}</p>
      <p className="font-bold text-navy-800">{m.name}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-navy-600">
        {m.yearsExperience !== null && <span>{m.yearsExperience} שנות ניסיון</span>}
        {m.matchesClosed !== null && m.matchesClosed > 0 && <span>{m.matchesClosed} שידוכים שנסגרו</span>}
        {m.city && <span>{m.city}</span>}
        {m.languages && <span>{m.languages}</span>}
      </div>
      {m.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {m.specialties.map((s) => <span key={s} className="rounded-full bg-white text-navy-600 text-xs px-3 py-1">{s}</span>)}
        </div>
      )}
      {m.biography && <p className="text-sm text-navy-600 pt-1 whitespace-pre-wrap">{m.biography}</p>}
    </div>
  )
}

/**
 * "Proposals I received": the matches a matchmaker opened for the candidate. Each card shows the
 * other person, the matchmaker handling it (never a phone number) and the matchmaking fee for that
 * specific match, which the candidate confirms they saw.
 */
export function ReceivedList({ locale }: { locale: string }) {
  const he = locale === 'he'
  const [list, setList] = useState<Received[] | null>(null)
  const [error, setError] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [datesId, setDatesId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await authed('/api/candidate/received')
      if (!res.ok) throw new Error('bad')
      const json = await res.json()
      setList(json.received ?? [])
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const acknowledge = async (matchId: string) => {
    setBusy(matchId)
    try {
      const res = await authed('/api/candidate/fees', { method: 'POST', body: JSON.stringify({ matchId }) })
      if (res.ok) await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <section id="received" className="flex flex-col gap-5">
      {openId && <ProposalDetailModal id={openId} he={he} onClose={() => setOpenId(null)} />}
      {datesId && <DateIdeasModal id={datesId} he={he} onClose={() => setDatesId(null)} />}

      <div className="rounded-[32px] bg-navy-800 text-white shadow-luxury px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-burgundy-300 mb-1">{he ? 'ההצעות שקיבלתי' : 'PROPOSALS I RECEIVED'}</p>
        <h2 className="text-2xl font-bold">
          {list === null && !error
            ? (he ? 'טוענים...' : 'Loading…')
            : !list || list.length === 0
              ? (he ? 'עדיין לא קיבלת הצעות משדכן' : 'No proposals from a matchmaker yet')
              : he ? `${list.length} ${list.length === 1 ? 'הצעה' : 'הצעות'} משדכן/ית` : `${list.length} from a matchmaker`}
        </h2>
        <p className="text-sm text-navy-100 mt-1">
          {he ? 'כאן מופיעות הצעות ששדכן/ית פתח/ה עבורך, עם פרטי השדכן/ית המטפל/ת ועדכוני דמי שידוך.' : 'Proposals a matchmaker opened for you, with the matchmaker’s details and fee updates.'}
        </p>
      </div>

      {error && <div className="rounded-[28px] bg-white p-8 text-center text-navy-500 shadow-card">{he ? 'לא הצלחנו לטעון. נסו לרענן.' : 'Could not load. Please refresh.'}</div>}
      {list && list.length === 0 && (
        <div className="rounded-[28px] bg-white p-8 text-center text-navy-500 shadow-card">
          {he ? 'כשתעניין אותך הצעה בהתאמות, שדכן/ית יכול/ה לפתוח אותה והיא תופיע כאן.' : 'When you are interested in a match, a matchmaker can open it and it will appear here.'}
        </div>
      )}

      {(list ?? []).map((r) => (
        <article key={r.matchId} className="rounded-[28px] bg-white shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-navy-800">
                {r.other.name} · {he ? `${r.other.gender === 'female' ? 'בת' : 'בן'} ${r.other.age ?? ''}` : `Age ${r.other.age ?? ''}`}
              </p>
              <p className="text-sm text-navy-500">{r.other.city} · {r.other.community}</p>
              <p className="text-sm text-navy-500">{r.other.occupation}</p>
            </div>
            <span className="rounded-full bg-burgundy-500 text-white text-xs font-bold px-3 py-1.5 shrink-0">{STAGE_HE[r.stage] ?? r.stage}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpenId(r.other.id)} className="h-11 px-6 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 text-sm font-semibold">
              {he ? 'לכרטיס המלא ולתמונות' : 'Full card and photos'}
            </button>
            {r.mutual && (
              <button type="button" onClick={() => setDatesId(r.other.id)} className="h-11 px-6 rounded-full bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold">
                {he ? 'מקומות לדייט' : 'Date places'}
              </button>
            )}
          </div>

          {!r.matchmaker && (
            <p className="rounded-2xl bg-[#f1f1f1] text-navy-600 text-sm px-4 py-3">
              {he ? 'יש עניין הדדי! שדכן/ית יצטרף/תצטרף בקרוב לטפל בהצעה, ופרטיו/ה יופיעו כאן.' : 'Mutual interest! A matchmaker will join soon, and their details will appear here.'}
            </p>
          )}
          {r.matchmaker && <MatchmakerInfo m={r.matchmaker} title={he ? 'השדכן/ית המטפל/ת בהצעה' : 'Matchmaker handling this'} />}
          {r.coMatchmaker && <MatchmakerInfo m={r.coMatchmaker} title={he ? 'שדכן/ית נוסף/ת שעובד/ת איתם' : 'Working together with'} />}

          {r.fee && (
            <div className="rounded-2xl border border-burgundy-200 bg-burgundy-50/40 px-5 py-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-burgundy-600">{he ? 'דמי שידוך להצעה הזאת' : 'Matchmaking fee for this proposal'}</p>
              <p className="text-2xl font-bold text-navy-800" dir="ltr">{Number(r.fee.amount).toLocaleString('he-IL')} ₪</p>
              <p className="text-sm text-navy-600">
                {he ? 'הסכום משולם רק לאחר סגירת האירוסין, ולא בשלבים קודמים.' : 'Paid only after the engagement, not before.'}
              </p>
              {r.fee.acknowledged ? (
                <p className="text-sm font-semibold text-green-700">{he ? '✓ אישרת שראית את הסכום' : '✓ You confirmed you saw the amount'}</p>
              ) : (
                <button
                  type="button" disabled={busy === r.matchId} onClick={() => acknowledge(r.matchId)}
                  className="self-start h-11 px-6 rounded-full bg-burgundy-500 hover:bg-burgundy-600 disabled:opacity-60 text-white text-sm font-bold"
                >
                  {he ? 'ראיתי ואני מאשר/ת' : 'I saw it and confirm'}
                </button>
              )}
            </div>
          )}

          <Link href={`/${locale}/contact`} className="self-start text-sm font-semibold text-navy-500 underline">
            {he ? 'שאלה? לדבר עם שדכנית' : 'Question? Talk to a matchmaker'}
          </Link>
        </article>
      ))}
    </section>
  )
}
