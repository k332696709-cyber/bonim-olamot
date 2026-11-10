'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { CompatibilityPanel } from '@/components/profile/CompatibilityPanel'
import { MaleProfileCard } from '@/components/profile/MaleProfileCard'
import { MOCK_FEMALE_PROFILES, MOCK_MALE_PROFILES } from '@/constants/mockProfiles'
import { createClient } from '@/lib/supabase/client'
import { mapProfileRow, PROFILE_SELECT } from '@/lib/supabase/mapProfile'
import { getSession } from '@/lib/auth/session'
import type { FemaleProfile, MaleProfile } from '@/types/registration'

/**
 * Loads one candidate's profile from the database (the real ones created from
 * registrations), falling back to the built-in demo profiles for their old ids.
 */
export function ProfileLoader({ locale, id }: { locale: string; id: string }) {
  const he = locale === 'he'
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [profile, setProfile] = useState<FemaleProfile | MaleProfile | null>(null)
  const [candidates, setCandidates] = useState<(FemaleProfile | MaleProfile)[]>([])
  const [photoUrl, setPhotoUrl] = useState('')
  const [fromDb, setFromDb] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsAdmin(getSession()?.role === 'admin')
    let alive = true
    ;(async () => {
      const db = createClient()
      const isUuid = /^[0-9a-f-]{36}$/i.test(id)
      if (isUuid) {
        const { data: row } = await db.from('profiles').select(PROFILE_SELECT).eq('id', id).maybeSingle()
        if (row && alive) {
          const g = (row as any).gender as 'male' | 'female'
          const { data: others } = await db
            .from('profiles').select(PROFILE_SELECT).eq('gender', g === 'female' ? 'male' : 'female')
          const p = mapProfileRow(row)
          setGender(g)
          setProfile(p)
          setCandidates((others ?? []).map(mapProfileRow))
          setFromDb(true)
          const path = (p.photos as string[])?.[0]
          if (path && !/^https?:/.test(path)) {
            const { data: signed } = await db.storage.from('registration-photos').createSignedUrl(path, 3600)
            if (signed?.signedUrl && alive) setPhotoUrl(signed.signedUrl)
          } else if (path && alive) {
            setPhotoUrl(path)
          }
          setState('ready')
          return
        }
      }
      // Built-in demo profiles
      const f = MOCK_FEMALE_PROFILES.find((p) => p.id === id)
      const m = MOCK_MALE_PROFILES.find((p) => p.id === id)
      if (!alive) return
      if (f) { setGender('female'); setProfile(f); setCandidates(MOCK_MALE_PROFILES); setState('ready') }
      else if (m) { setGender('male'); setProfile(m); setCandidates(MOCK_FEMALE_PROFILES); setState('ready') }
      else setState('missing')
    })()
    return () => { alive = false }
  }, [id])

  const remove = async () => {
    if (!profile) return
    const q = he
      ? `למחוק את הפרופיל של ${profile.firstName} ${profile.lastName} לצמיתות? גם ההערות וההתאמות שלו יימחקו. אי אפשר לשחזר.`
      : `Permanently delete ${profile.firstName} ${profile.lastName}'s profile? Their notes and matches are deleted too. This cannot be undone.`
    if (!window.confirm(q)) return
    setError('')
    const { error: err } = await createClient().from('profiles').delete().eq('id', id)
    if (err) {
      setError(he ? 'המחיקה נכשלה. ייתכן שאין לך הרשאה.' : 'Delete failed. You may not have permission.')
      return
    }
    router.push(`/${locale}/matchmaker`)
  }

  if (state === 'loading') return <p className="text-center py-16 text-gray-400">{he ? 'טוען...' : 'Loading…'}</p>
  if (state === 'missing' || !profile) {
    return <div className="text-center py-16 text-gray-400">{he ? 'הפרופיל לא נמצא' : 'Profile not found'}</div>
  }

  return (
    <div className="flex flex-col gap-6">
      {(photoUrl || (isAdmin && fromDb)) && (
        <div className="flex items-center gap-4 flex-wrap">
          {photoUrl && (
            // Signed URL from private storage, so next/image is not used.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="w-28 h-28 rounded-3xl object-cover bg-white shadow-card" />
          )}
          {isAdmin && fromDb && (
            <button onClick={remove} className="h-10 px-5 rounded-full border border-burgundy-300 text-burgundy-600 hover:bg-burgundy-50 text-sm font-semibold ms-auto">
              {he ? 'מחיקת הפרופיל' : 'Delete profile'}
            </button>
          )}
        </div>
      )}
      {error && <p className="rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-600 text-sm px-5 py-3" role="alert">{error}</p>}

      {gender === 'female' ? (
        <>
          <ProfileCard profile={profile as FemaleProfile} locale={locale} />
          <CompatibilityPanel
            currentProfile={profile as FemaleProfile}
            currentGender="female"
            candidates={candidates as MaleProfile[]}
            locale={locale}
          />
        </>
      ) : (
        <MaleProfileCard profile={profile as MaleProfile} locale={locale} femaleCandidates={candidates as FemaleProfile[]} />
      )}
    </div>
  )
}
