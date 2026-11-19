import type { Engagement } from '@/components/engagements/EngagementCard'

/** Approved engagement announcements, newest first. Returns [] if the table is not there yet. */
export async function fetchPublishedEngagements(limit = 60): Promise<Engagement[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const { data, error } = await (createClient() as any)
      .from('engagements')
      .select('id, groom_name, groom_father, groom_community, groom_city, bride_name, bride_father, bride_community, bride_city, engaged_on')
      .eq('status', 'published')
      .order('engaged_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return data as Engagement[]
  } catch {
    return []
  }
}
