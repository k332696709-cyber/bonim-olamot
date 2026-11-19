import { hebrewDate } from '@/lib/registration/birthDate'

export interface Engagement {
  id: string
  groom_name: string
  groom_father: string | null
  groom_community: string | null
  groom_city: string | null
  bride_name: string
  bride_father: string | null
  bride_community: string | null
  bride_city: string | null
  engaged_on: string
}

function Side({ role, name, father, community, city }: { role: string; name: string; father: string | null; community: string | null; city: string | null }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-xs font-semibold tracking-widest text-burgundy-500">{role}</p>
      <p className="text-lg sm:text-xl font-bold text-navy-800 break-words">{name}</p>
      {father && <p className="text-sm text-navy-500">בהר״ר {father}</p>}
      {(community || city) && <p className="text-sm text-navy-500">{[community, city].filter(Boolean).join(' · ')}</p>}
    </div>
  )
}

/** One engagement announcement, in the site's own style: a dark top band and the two sides below. */
export function EngagementCard({ e }: { e: Engagement }) {
  const heb = hebrewDate(e.engaged_on)
  return (
    <article className="rounded-[28px] bg-white shadow-card overflow-hidden flex flex-col">
      <div className="hero-dark text-white px-6 py-5 flex items-center justify-between gap-3">
        <p className="text-3xl sm:text-4xl font-bold">מאורסים</p>
        {heb && <p className="text-sm text-navy-100 text-end">{`בס״ד, ${heb}`}</p>}
      </div>
      <div className="px-6 py-6 grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
        <Side role="החתן" name={e.groom_name} father={e.groom_father} community={e.groom_community} city={e.groom_city} />
        <span className="self-center text-2xl text-burgundy-400" aria-hidden>♥</span>
        <Side role="הכלה" name={e.bride_name} father={e.bride_father} community={e.bride_community} city={e.bride_city} />
      </div>
    </article>
  )
}
