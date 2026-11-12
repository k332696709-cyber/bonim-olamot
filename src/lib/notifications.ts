/* eslint-disable */
import { createClient } from '@/lib/supabase/client'
import { restoreSession } from '@/lib/auth/session'

export interface NotificationDef {
  /** Changes when the content changes, so a new count shows up as unread again. */
  id: string
  text: string
  href: string
}

export type Audience = 'admin' | 'matchmaker' | 'candidate' | 'visitor'

const REGS_SINCE_KEY = 'bell:since'

const sinceDate = (): string => {
  try {
    const v = localStorage.getItem(REGS_SINCE_KEY)
    if (v) return v
  } catch { /* ignore */ }
  return new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
}

/** Called when the person marks everything as read: registrations are counted from now on. */
export function markRegistrationsSeen() {
  try { localStorage.setItem(REGS_SINCE_KEY, new Date().toISOString()) } catch { /* ignore */ }
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many.replace('{n}', String(n)))

/**
 * Real notifications from the database, by who is signed in:
 * the administrator sees what needs handling (inquiries, photos, matchmaker requests, new
 * registrations), matchmakers see new candidates, candidates see what happened to their photos.
 */
export async function loadNotifications(locale: string): Promise<{ audience: Audience; items: NotificationDef[] }> {
  const he = locale === 'he'
  const L = (path: string) => `/${locale}${path}`
  const db = createClient() as any

  const staff = await restoreSession()
  const items: NotificationDef[] = []

  const count = async (table: string, build: (q: any) => any): Promise<number> => {
    try {
      const { count: c } = await build(db.from(table).select('id', { count: 'exact', head: true }))
      return c ?? 0
    } catch {
      return 0
    }
  }

  if (staff) {
    const since = sinceDate()
    const isAdmin = staff.role === 'admin'

    if (isAdmin) {
      const msgs = await count('contact_messages', (q) => q.eq('is_read', false))
      if (msgs > 0) items.push({ id: `msgs:${msgs}`, href: L('/matchmaker/inbox'), text: he ? plural(msgs, 'פנייה חדשה בתיבת הפניות', '{n} פניות חדשות בתיבת הפניות') : `${msgs} new inquiries` })

      const photos = await count('candidate_photos', (q) => q.eq('status', 'pending'))
      if (photos > 0) items.push({ id: `photos:${photos}`, href: L('/matchmaker/photos'), text: he ? plural(photos, 'תמונה ממתינה לאישור', '{n} תמונות ממתינות לאישור') : `${photos} photos waiting for review` })

      const apps = await count('matchmaker_applications', (q) => q.eq('status', 'pending'))
      if (apps > 0) items.push({ id: `apps:${apps}`, href: L('/matchmaker/team'), text: he ? plural(apps, 'בקשת שדכן ממתינה לאישור', '{n} בקשות שדכנים ממתינות לאישור') : `${apps} matchmaker requests waiting` })

      const men = await count('male_registrations', (q) => q.gt('created_at', since))
      const women = await count('female_registrations', (q) => q.gt('created_at', since))
      const regs = men + women
      if (regs > 0) items.push({ id: `regs:${regs}`, href: L('/matchmaker/registrations'), text: he ? plural(regs, 'הרשמה חדשה', '{n} הרשמות חדשות') : `${regs} new registrations` })
    } else {
      const fresh = await count('profiles', (q) => q.gt('created_at', since))
      if (fresh > 0) items.push({ id: `profiles:${fresh}`, href: L('/matchmaker'), text: he ? plural(fresh, 'מועמד/ת חדש/ה בלוח', '{n} מועמדים חדשים בלוח') : `${fresh} new candidates on the board` })
    }
    return { audience: isAdmin ? 'admin' : 'matchmaker', items }
  }

  // A signed-in candidate: what happened to their photos.
  const { data } = await db.auth.getSession()
  const user = data?.session?.user
  if (!user) return { audience: 'visitor', items }

  const { data: rows } = await db.from('candidate_photos').select('status').eq('user_id', user.id)
  const list: { status: string }[] = rows ?? []
  const rejected = list.filter((r) => r.status === 'rejected').length
  const approved = list.filter((r) => r.status === 'approved').length
  const pending = list.filter((r) => r.status === 'pending').length
  if (rejected > 0) items.push({ id: `rejected:${rejected}`, href: L('/personal'), text: he ? plural(rejected, 'תמונה לא אושרה. אפשר להחליף אותה', '{n} תמונות לא אושרו. אפשר להחליף אותן') : `${rejected} photos were not approved. You can replace them` })
  if (approved > 0) items.push({ id: `approved:${approved}`, href: L('/personal'), text: he ? plural(approved, 'תמונה אושרה והיא מוצגת בפרופיל', '{n} תמונות אושרו והן מוצגות בפרופיל') : `${approved} photos approved and shown on your profile` })
  if (pending > 0) items.push({ id: `pending:${pending}`, href: L('/personal'), text: he ? plural(pending, 'תמונה ממתינה לבדיקה', '{n} תמונות ממתינות לבדיקה') : `${pending} photos waiting for review` })
  return { audience: 'candidate', items }
}
