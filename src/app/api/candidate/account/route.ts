import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findRegistration, PHOTO_BUCKET } from '@/lib/server/photos'
import { notifyOwner } from '@/lib/server/notify'

export const runtime = 'nodejs'

/**
 * A candidate deletes their own account: the profile, the questionnaire answers, the photos and the login.
 * Matches and interest that involved them go with the profile. This cannot be undone.
 */
export async function DELETE(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ message: 'הפעולה אינה זמינה כרגע.' }, { status: 503 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  let body: { confirm?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })
  }
  if (body.confirm !== true) return NextResponse.json({ message: 'בקשה לא תקינה.' }, { status: 400 })

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as any
  const { data: caller } = await admin.auth.getUser(token)
  const user = caller?.user
  if (!user) return NextResponse.json({ message: 'נדרשת התחברות.' }, { status: 401 })

  // Staff logins are never deleted here.
  const { data: staff } = await admin.from('matchmakers').select('id').eq('user_id', user.id).maybeSingle()
  if (staff) return NextResponse.json({ message: 'זה חשבון של שדכן/מנהל.' }, { status: 400 })

  const found = await findRegistration(admin, user.id)

  // An engagement that closed through the site: the account stays until the matchmaker confirms the fee was received.
  if (found?.reg.profile_id) {
    const pid = found.reg.profile_id
    const { data: owing } = await admin
      .from('matches').select('id')
      .or(`female_id.eq.${pid},male_id.eq.${pid}`)
      .eq('stage', 'closing').neq('status', 'rejected')
      .not('fee_amount', 'is', null).is('fee_paid_at', null)
      .limit(1)
    if ((owing ?? []).length > 0) {
      return NextResponse.json({
        message: 'השידוך שלכם נסגר דרך האתר, ולכן אי אפשר למחוק את החשבון עד שדמי השידוך ישולמו והשדכן/ית יאשר/תאשר שהתקבלו. אפשר לפנות אל השדכן/ית.',
      }, { status: 409 })
    }
  }
  const name = `${found?.reg.answers?.fullName ?? ''} ${found?.reg.answers?.lastName ?? ''}`.trim()

  // Photos: the files first, then their rows.
  const { data: photos } = await admin.from('candidate_photos').select('path').eq('user_id', user.id)
  const paths: string[] = (photos ?? []).map((p: any) => p.path).filter(Boolean)
  if (found) {
    const r = await admin.from(found.table).select('photo_path, extra_photo_paths').eq('id', found.reg.id).maybeSingle()
    if (r.data?.photo_path) paths.push(r.data.photo_path)
    for (const x of r.data?.extra_photo_paths ?? []) if (x) paths.push(x)
  }
  if (paths.length) await admin.storage.from(PHOTO_BUCKET).remove(Array.from(new Set(paths)))
  await admin.from('candidate_photos').delete().eq('user_id', user.id)

  if (found?.reg.profile_id) {
    const { error } = await admin.from('profiles').delete().eq('id', found.reg.profile_id)
    if (error) {
      console.error('account delete: profile failed:', error.message)
      return NextResponse.json({ message: 'המחיקה נכשלה. נסו שוב.' }, { status: 502 })
    }
  }
  if (found) await admin.from(found.table).delete().eq('id', found.reg.id)

  const { error: authErr } = await admin.auth.admin.deleteUser(user.id)
  if (authErr) {
    console.error('account delete: login failed:', authErr.message)
    return NextResponse.json({ message: 'הנתונים נמחקו, אבל ההתחברות לא. פנו אלינו.' }, { status: 502 })
  }

  await notifyOwner('מועמד/ת מחק/ה את החשבון', [name ? `שם: ${name}` : 'חשבון ללא שם'], '/he/matchmaker/registrations')
  return NextResponse.json({ ok: true })
}
