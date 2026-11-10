import Link from 'next/link'
import { BotChat } from '@/components/home/BotChat'
import { DashboardMockup } from '@/components/home/DashboardMockup'
import { SmartAssistantMockup } from '@/components/home/SmartAssistantMockup'
import { Reveal } from '@/components/home/Reveal'
import { getT } from '@/lib/i18n/translations'
import { DATE_SPOTS_MOCK } from '@/constants/dateSpotsMockData'
import { CATEGORY_LABELS } from '@/types/dateSpots'

const pill =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200'

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const T = getT(locale)
  const isHe = locale === 'he'
  const arrow = isHe ? '←' : '→'

  const previewSpots = DATE_SPOTS_MOCK.slice(0, 3)

  const marqueeWords = isHe
    ? ['שידוכים', 'ייעוץ', 'גיבוש', 'טיפים', 'ועוד']
    : ['Matchmaking', 'Counseling', 'Group events', 'Tips', 'And more']

  return (
    <div className="flex flex-col -mt-[5.25rem]" dir={isHe ? 'rtl' : 'ltr'}>

      {/* ══ 1. Hero (dark) ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-800 text-[#f1f1f1] px-4 pt-40 pb-24 sm:pt-48 sm:pb-32">
        <div className="absolute inset-0 bg-grid-dark" aria-hidden="true" />
        {/* soft glowing orbs, same palette as the brand */}
        <div className="absolute -top-24 start-[-8rem] w-[28rem] h-[28rem] rounded-full bg-navy-400/30 blur-3xl animate-float" aria-hidden="true" />
        <div className="absolute bottom-[-10rem] end-[-6rem] w-[26rem] h-[26rem] rounded-full bg-burgundy-400/30 blur-3xl animate-float" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-8 items-center">
         <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-2 text-sm text-burgundy-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-burgundy-300" />
            {isHe ? 'אתר שידוכים מתקדם לקהילה החרדית' : 'Advanced matchmaking for the Haredi community'}
          </span>

          <h1 className="leading-[1.1] mb-6">
            <span className="block text-4xl sm:text-6xl font-light">
              {isHe ? 'הגיע הזמן לבנות' : 'Time to build'}
            </span>
            <span className="block text-5xl sm:text-7xl font-bold text-burgundy-300">
              {isHe ? 'עולמות.' : 'worlds.'}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-navy-100 max-w-xl mx-auto lg:mx-0 mb-10">
            {isHe
              ? 'ארגון בונים עולמות: הרשמה פשוטה, שדכנים מקצועיים והתאמה חכמה. הכל במקום אחד.'
              : 'Bonim Olamot: simple registration, professional matchmakers and smart matching, all in one place.'}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link
              href={`/${locale}/register/male`}
              className={`${pill} h-14 px-8 text-lg bg-burgundy-400 text-white hover:bg-burgundy-300 glow-burgundy`}
            >
              {T.home.male} <span aria-hidden>{arrow}</span>
            </Link>
            <Link
              href={`/${locale}/register/female`}
              className={`${pill} h-14 px-8 text-lg bg-white text-navy-700 hover:bg-navy-50`}
            >
              {T.home.female} <span aria-hidden>{arrow}</span>
            </Link>
            <Link
              href={`/${locale}/register/matchmaker`}
              className={`${pill} h-14 px-7 text-base font-medium border border-white/30 text-white hover:bg-white/10`}
            >
              {isHe ? 'לשדכנים' : 'For matchmakers'}
            </Link>
          </div>
         </div>

         <BotChat locale={locale} />
        </div>
      </section>

      {/* ══ Marquee strip ══════════════════════════════════════════════════════ */}
      <div className="bg-burgundy-500 text-white overflow-hidden py-4 select-none" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <div key={n} className="flex items-center shrink-0">
              {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
                <span key={`${n}-${i}`} className="flex items-center text-lg font-medium">
                  <span className="px-6">{w}</span>
                  <span className="text-white/60">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ Dashboard preview (light) ══════════════════════════════════════════ */}
      <section className="px-4 pt-20 sm:pt-28 pb-4 bg-[#f1f1f1]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
            <span className="font-light">{isHe ? 'מבחוץ אתר. ' : 'Outside, a website. '}</span>
            <span className="font-bold text-burgundy-500">{isHe ? 'מבפנים מערכת.' : 'Inside, a system.'}</span>
          </h2>
          <p className="text-navy-500 text-base sm:text-lg mt-3 max-w-xl mx-auto">
            {isHe
              ? 'כל מועמד, כל הצעה וכל שלב בדרך לשידוך, מסודרים בלוח אחד עבור השדכנים.'
              : 'Every candidate, proposal and step on the way to a match, organized in one dashboard for matchmakers.'}
          </p>
        </div>
        <DashboardMockup locale={locale} />
      </section>

      {/* ══ Smart assistant (dark) ═════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-800 text-[#f1f1f1] px-4 py-20 sm:py-28 mt-16 sm:mt-24 rounded-[40px] mx-2 sm:mx-4">
        <div className="absolute inset-0 bg-grid-dark" aria-hidden="true" />
        <div className="absolute -top-24 end-[-6rem] w-[26rem] h-[26rem] rounded-full bg-navy-400/30 blur-3xl animate-float" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <Reveal className="text-center lg:text-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-2 text-sm text-burgundy-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-burgundy-300" />
              {isHe ? 'חדש · העוזר החכם' : 'New · Smart assistant'}
            </span>
            <h2 className="text-3xl sm:text-5xl leading-tight mb-5">
              <span className="font-light">{isHe ? 'ספרו מה אתם מחפשים. ' : 'Tell us what you look for. '}</span>
              <span className="font-bold text-burgundy-300">{isHe ? 'העוזר החכם ימצא.' : 'The assistant finds.'}</span>
            </h2>
            <p className="text-navy-100 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-8">
              {isHe
                ? 'אחרי ההרשמה, העוזר החכם מציע לכם הצעות שמתאימות לבקשות שלכם: מיועדים רואים מיועדות, ומיועדות רואות מיועדים. הפרטים אנונימיים עד שהשדכנים מחברים.'
                : 'After registering, the smart assistant suggests matches for what you describe: men see women and women see men. Details stay anonymous until a matchmaker connects you.'}
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href={`/${locale}/smart-match`}
                className={`${pill} h-14 px-8 text-lg bg-burgundy-400 text-white hover:bg-burgundy-300 glow-burgundy`}
              >
                {isHe ? 'לעוזר החכם' : 'Open the assistant'} <span aria-hidden>{arrow}</span>
              </Link>
              <Link
                href={`/${locale}/register/male`}
                className={`${pill} h-14 px-7 text-base font-medium border border-white/30 text-white hover:bg-white/10`}
              >
                {isHe ? 'עוד לא נרשמתם? להרשמה' : 'Not registered yet? Sign up'}
              </Link>
            </div>
          </Reveal>
          <SmartAssistantMockup locale={locale} />
        </div>
      </section>

      {/* ══ 2. Candidates (light) ══════════════════════════════════════════════ */}
      <section className="px-4 py-20 sm:py-28 bg-[#f1f1f1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold tracking-widest text-burgundy-500 mb-3">
              {isHe ? 'הרשמת מועמדים' : 'CANDIDATE REGISTRATION'}
            </p>
            <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
              <span className="font-light">{isHe ? 'מתחילים את ' : 'Start your '}</span>
              <span className="font-bold">{isHe ? 'המסע.' : 'journey.'}</span>
            </h2>
          </div>

          <Reveal delay={150} className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Male */}
            <Link
              href={`/${locale}/register/male`}
              className="group flex flex-col gap-5 p-8 bg-navy-800 text-white rounded-[28px]
                shadow-[0_30px_60px_rgba(0,21,41,0.18)] hover:-translate-y-1.5 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-navy-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-2xl">{T.home.male}</p>
                <p className="text-navy-200 text-sm mt-1.5">{T.home.maleDesc}</p>
              </div>
              <span className={`${pill} self-start h-11 px-6 text-sm bg-white text-navy-700 group-hover:bg-navy-50`}>
                {T.home.maleCta} <span aria-hidden>{arrow}</span>
              </span>
            </Link>

            {/* Female */}
            <Link
              href={`/${locale}/register/female`}
              className="group flex flex-col gap-5 p-8 bg-white text-navy-800 rounded-[28px]
                shadow-[0_30px_60px_rgba(0,21,41,0.10)] hover:-translate-y-1.5 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-burgundy-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-burgundy-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-2xl text-burgundy-600">{T.home.female}</p>
                <p className="text-navy-500 text-sm mt-1.5">{T.home.femaleDesc}</p>
              </div>
              <span className={`${pill} self-start h-11 px-6 text-sm bg-burgundy-500 text-white group-hover:bg-burgundy-600`}>
                {T.home.femaleCta} <span aria-hidden>{arrow}</span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ 3. Matchmaker Corner (dark) ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-navy-800 text-[#f1f1f1] px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-grid-dark opacity-70" aria-hidden="true" />
        <Reveal className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl leading-tight mb-4">
            <span className="font-light">{isHe ? 'קורנר ' : 'Matchmaker '}</span>
            <span className="font-bold text-burgundy-300">{isHe ? 'השדכנים' : 'Corner'}</span>
          </h2>
          <p className="text-navy-100 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            {isHe
              ? 'שדכן/ית? הצטרפו לרשת השדכנים של בונים עולמות ועזרו לבנות עולמות'
              : 'Are you a matchmaker? Join our network and help build families'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${locale}/register/matchmaker`}
              className={`${pill} h-14 px-8 text-lg bg-burgundy-400 text-white hover:bg-burgundy-300 glow-burgundy`}
            >
              {isHe ? 'הרשמת שדכנים' : 'Matchmaker Registration'} <span aria-hidden>{arrow}</span>
            </Link>
            <Link
              href={`/${locale}/login`}
              className={`${pill} h-14 px-8 text-lg font-medium border border-white/30 text-white hover:bg-white/10`}
            >
              {isHe ? 'כניסת שדכנים' : 'Matchmaker Login'}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══ 4. Dating Spots (light) ════════════════════════════════════════════ */}
      <section className="bg-[#f1f1f1] px-4 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight mb-3">
              <span className="font-light">{isHe ? 'מקומות ' : 'Dating '}</span>
              <span className="font-bold">{isHe ? 'לדייט' : 'Spots'}</span>
            </h2>
            <p className="text-navy-500 text-base sm:text-lg max-w-lg mx-auto">
              {isHe
                ? 'מקומות מומלצים לפגישות שידוכים ברחבי הארץ'
                : 'Recommended venues for first dates across the country'}
            </p>
          </div>

          <Reveal className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {previewSpots.map((spot) => {
              const cat = CATEGORY_LABELS[spot.category]
              return (
                <div
                  key={spot.id}
                  className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,21,41,0.08)] overflow-hidden flex flex-col
                    hover:-translate-y-1.5 transition-transform duration-300"
                >
                  <div className="bg-navy-800 text-white px-5 py-3.5 flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-xs font-semibold bg-white/15 rounded-full px-3 py-1">
                      {isHe ? cat.he : cat.en}
                    </span>
                    {spot.kosher && (
                      <span className="text-[10px] font-bold rounded-full px-2.5 py-1 bg-burgundy-400 text-white ms-auto">
                        {isHe ? '✓ כשר' : '✓ Kosher'}
                      </span>
                    )}
                  </div>

                  <div className="px-5 py-5 flex flex-col gap-2 flex-1">
                    <div>
                      <h3 className="text-base font-bold text-navy-800 leading-snug">{spot.name}</h3>
                      <p className="text-xs text-navy-400 mt-0.5">📍 {spot.city}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.round(spot.averageRating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-xs text-navy-400 ms-1">{spot.averageRating}</span>
                    </div>

                    <p className="text-sm text-navy-600 leading-relaxed line-clamp-2 flex-1">{spot.vibe}</p>

                    {spot.priceRange && (
                      <span className="text-xs text-navy-300 font-mono">{spot.priceRange}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </Reveal>

          <div className="text-center">
            <Link
              href={`/${locale}/date-spots`}
              className={`${pill} h-14 px-8 text-base bg-navy-800 text-white hover:bg-navy-700`}
            >
              {isHe ? 'לכל המקומות' : 'View All Spots'} <span aria-hidden>{arrow}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
