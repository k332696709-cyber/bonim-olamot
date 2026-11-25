'use client'

import { useState } from 'react'
import { Reveal } from './Reveal'

const ITEMS: { q: [string, string]; a: [string, string] }[] = [
  {
    q: ['האם כולם רואים את הפרטים שלי?', 'Can everyone see my details?'],
    a: ['לא. הפרטים המלאים נראים לשדכנים בלבד. מועמדים אחרים רואים רק פרטים אנונימיים, ורק את מה שנחוץ להתאמה.', 'No. Your full details are visible to matchmakers only. Other candidates see anonymous details, and only what the match needs.'],
  },
  {
    q: ['כמה עולה ההרשמה?', 'How much does registration cost?'],
    a: ['ההרשמה בחינם. בהמשך יתווסף גם מסלול פרימיום עם עוד אפשרויות.', 'Registration is free. A premium plan with more options will be added later.'],
  },
  {
    q: ['האם אני חייב להעלות תמונה?', 'Do I have to upload a photo?'],
    a: ['לא חובה. אבל פרופיל בלי תמונה מקבל ערך נמוך יותר, וכדאי להעלות.', 'It is not required. But a profile without a photo is rated lower, so we recommend adding one.'],
  },
  {
    q: ['מי מאשר את התמונה ומתי היא מוצגת?', 'Who approves my photo, and when is it shown?'],
    a: ['מנהל האתר בודק כל תמונה לפני שהיא מוצגת. רק אחרי שהאישור ניתן, התמונה מוצגת לפי הגדרות הפרטיות שבחרתם.', 'The site administrator reviews every photo before it is shown. Only once it is approved is it shown, according to the privacy setting you chose.'],
  },
  {
    q: ['מי רואה את התמונה שלי?', 'Who sees my photo?'],
    a: ['אתם בוחרים. אם בחרתם שהתמונה תוצג רק אחרי עניין הדדי, השדכנים והצד השני יראו אותה רק אז. אם בחרתם שלא תוצג, רק שדכנים יראו אותה, והצד השני אחרי עניין הדדי.', 'You choose. If you chose to show it only after mutual interest, matchmakers and the other side see it only then. If you chose not to show it, only matchmakers see it, and the other side after mutual interest.'],
  },
  {
    q: ['מה קורה אחרי שמילאתי את השאלון?', 'What happens after I finish the questionnaire?'],
    a: ['כשהשאלון מגיע ל-100% נפתח הפרופיל, ומתחילות להגיע הצעות מותאמות באזור האישי.', 'When the questionnaire reaches 100% your profile opens and matching suggestions start arriving in your personal area.'],
  },
  {
    q: ['איך נעשית ההתאמה?', 'How is the matching done?'],
    a: ['המערכת מדרגת את ההצעות לפי התאמה ומציגה רק התאמות גבוהות. אפשר לדייק אותן עם העוזר החכם.', 'The system ranks suggestions by compatibility and shows only high matches. You can refine them with the smart assistant.'],
  },
  {
    q: ['האם העוזר החכם מחליף שדכן?', 'Does the smart assistant replace a matchmaker?'],
    a: ['לא. העוזר מדייק הצעות ועונה על שאלות. כשיש עניין הדדי, שדכן/ית נכנס/ת לתמונה.', 'No. The assistant refines suggestions and answers questions. When interest is mutual, a matchmaker steps in.'],
  },
  {
    q: ['כמה עולים דמי השידוך, ומתי משלמים?', 'What is the matchmaking fee, and when is it paid?'],
    a: ['דמי השידוך נקבעים על ידי השדכן/ית ונשלחים אליכם מראש. הם משולמים רק אחרי האירוסין.', 'The fee is set by the matchmaker and sent to you in advance. It is paid only after the engagement.'],
  },
  {
    q: ['האם אפשר למחוק את החשבון?', 'Can I delete my account?'],
    a: ['כן, בכל רגע מהאזור האישי. אם השידוך נסגר דרך האתר, אפשר למחוק רק אחרי ששילמתם את דמי השידוך והשדכן/ית אישר/ה שהתקבלו.', 'Yes, at any time from your personal area. If your match closed through the site, you can delete only after the fee is paid and the matchmaker confirmed it was received.'],
  },
]

/** Short questions and short answers; one opens at a time. */
export function Faq({ he }: { he: boolean }) {
  const [open, setOpen] = useState<number | null>(null)
  const i = he ? 0 : 1

  return (
    <section className="px-4 py-20 sm:py-28 bg-white" dir={he ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl text-navy-800 leading-tight">
            <span className="font-light">{he ? 'שאלות ' : 'Common '}</span>
            <span className="font-bold">{he ? 'נפוצות' : 'questions'}</span>
          </h2>
          <p className="text-navy-500 mt-3">{he ? 'תשובות קצרות לדברים שהכי שואלים.' : 'Short answers to what people ask most.'}</p>
        </div>

        <Reveal className="flex flex-col gap-3">
          {ITEMS.map((it, n) => {
            const on = open === n
            return (
              <div key={n} className={`rounded-2xl border transition-colors ${on ? 'bg-[#f1f1f1] border-navy-100' : 'bg-white border-navy-100 hover:border-navy-300'}`}>
                <button
                  type="button" aria-expanded={on} onClick={() => setOpen(on ? null : n)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="font-semibold text-navy-800">{it.q[i]}</span>
                  <span
                    className="shrink-0 w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center text-lg leading-none transition-transform duration-300"
                    style={{ transform: on ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  >+</span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: on ? '1fr' : '0fr', opacity: on ? 1 : 0 }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-navy-600 leading-relaxed">{it.a[i]}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
