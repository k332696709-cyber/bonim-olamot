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

function Corner({ className }: { className: string }) {
  return (
    <svg className={`absolute w-7 h-7 text-navy-300 ${className}`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3 25V12c0-5 4-9 9-9h13" />
      <path d="M8 25V14c0-3.3 2.7-6 6-6h11" opacity=".6" />
      <circle cx="5" cy="5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Side({ name, father, community, city }: { name: string; father: string | null; community: string | null; city: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-lg sm:text-xl font-bold text-navy-800 break-words">{name}</p>
      {father && <p className="text-sm sm:text-base text-navy-500">בהר״ר {father}</p>}
      {community && <p className="text-sm sm:text-base text-navy-500">{community}</p>}
      {city && <p className="text-sm sm:text-base text-navy-500">{city}</p>}
    </div>
  )
}

/** One engagement announcement: the groom's side, the bride's side, "מאורסים" and the Hebrew date. */
export function EngagementCard({ e }: { e: Engagement }) {
  const heb = hebrewDate(e.engaged_on)
  return (
    <article className="relative rounded-[28px] bg-white border border-navy-100 shadow-card p-2.5">
      <div className="relative rounded-[22px] border-2 border-navy-100 px-6 sm:px-9 py-7">
        <Corner className="top-1.5 start-1.5" />
        <Corner className="top-1.5 end-1.5 -scale-x-100" />
        <Corner className="bottom-1.5 start-1.5 -scale-y-100" />
        <Corner className="bottom-1.5 end-1.5 -scale-x-100 -scale-y-100" />
        <div className="grid grid-cols-2 gap-6 items-start">
          <Side name={e.groom_name} father={e.groom_father} community={e.groom_community} city={e.groom_city} />
          <Side name={e.bride_name} father={e.bride_father} community={e.bride_community} city={e.bride_city} />
        </div>
        <p className="text-center text-4xl sm:text-5xl font-bold text-navy-800 mt-6">מאורסים</p>
        {heb && <p className="text-center text-sm text-navy-400 mt-3">{`בס״ד, ${heb}`}</p>}
      </div>
    </article>
  )
}
