/**
 * The free text of a profile ("about me" and "what I look for") holds a first paragraph written by the
 * person and then one "label: value" line per answer of the questionnaire. This shows it in clear
 * sections instead of one run-on paragraph.
 */

const GROUPS: { title: string; labels: string[] }[] = [
  { title: 'פרטים אישיים', labels: ['כינוי', 'מי מילא את הכרטיס', 'וואטסאפ', 'מסרונים', 'שיחות טלפון', 'עדה', 'מגורים'] },
  {
    title: 'לימודים ועיסוק',
    labels: ['לימודי מקצוע', 'לימודי מקצוע בעבר', 'לימודי מקצוע כעת', 'לימודי מקצוע בעתיד', 'לימודים', 'ישיבה קטנה', 'ישיבה גדולה', 'ישיבה גבוהה', 'תיכון', 'סמינר', 'מדרשה', 'קביעת עיתים/מסגרת'],
  },
  {
    title: 'סגנון ולבוש',
    labels: ['איך מגדיר/ה את הסגנון', 'פירוט הסגנון', 'סגנון לבוש', 'כובע/כיסוי ראש אחרי חתונה', 'גישה לטכנולוגיה', 'רמת חיים/סגנון'],
  },
  { title: 'אופי וערכים', labels: ['מאפיינים', 'מה מביא/ה לנישואים'] },
  { title: 'משפחה ובריאות', labels: ['מצב רפואי/נפשי', 'פירוט רפואי/נפשי', 'מצב ההורים', 'סגנון הבית'] },
  { title: 'מספרים לבירורים', labels: ['מספרים לבירורים'] },
  {
    title: 'מה מבוקש',
    labels: ['סגנון מבוקש', 'פירוט הסגנון המבוקש', 'סגנון לבוש שלו/ה', 'כיסוי ראש/כובע', 'עדה/זרם מעודפים', 'טווח גילאים', 'ארץ מועדפת'],
  },
]

interface Row { label: string; value: string }

export function parseResume(text: string | undefined | null): { intro: string; rows: Row[] } {
  const lines = (text ?? '').split('\n')
  const intro: string[] = []
  const rows: Row[] = []
  let inRows = false
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { if (intro.length) inRows = true; continue }
    const i = line.indexOf(': ')
    // A "label: value" line has a short label; the person's own paragraph can contain colons too.
    if (inRows && i > 0 && i <= 40) rows.push({ label: line.slice(0, i), value: line.slice(i + 2) })
    else if (!inRows) intro.push(line)
    else rows.push({ label: 'פרטים נוספים', value: line })
  }
  return { intro: intro.join('\n'), rows }
}

function Value({ label, value }: Row) {
  // Inquiry contacts: one person per line, with the phone as a link.
  if (label === 'מספרים לבירורים') {
    return (
      <ul className="flex flex-col gap-1">
        {value.split(' | ').map((p, i) => {
          const phone = p.match(/0\d[\d-]{7,10}|\+972\d{8,10}/)?.[0]
          return (
            <li key={i}>
              {phone ? p.replace(phone, '').trim() : p}{' '}
              {phone && <a href={`tel:${phone.replace(/-/g, '')}`} dir="ltr" className="font-semibold text-burgundy-600">{phone}</a>}
            </li>
          )
        })}
      </ul>
    )
  }
  return <span className="break-words">{value}</span>
}

export function ResumeText({ text }: { text: string | undefined | null }) {
  const { intro, rows } = parseResume(text)
  if (!intro && rows.length === 0) return null

  const used = new Set<number>()
  const sections = GROUPS.map((g) => {
    const items = rows.map((r, idx) => ({ r, idx })).filter(({ r }) => g.labels.includes(r.label))
    items.forEach(({ idx }) => used.add(idx))
    return { title: g.title, rows: items.map(({ r }) => r) }
  }).filter((s) => s.rows.length > 0)
  const rest = rows.filter((_, idx) => !used.has(idx))
  if (rest.length) sections.push({ title: 'פרטים נוספים', rows: rest })

  return (
    <div className="flex flex-col gap-4">
      {intro && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{intro}</p>}
      {sections.map((s) => (
        <section key={s.title}>
          <h4 className="text-xs font-bold text-navy-500 mb-1.5">{s.title}</h4>
          <dl className="rounded-xl bg-[#f7f7f7] divide-y divide-white">
            {s.rows.map((r, i) => (
              <div key={`${r.label}-${i}`} className="grid grid-cols-[8.5rem_1fr] gap-3 px-3 py-2 text-sm">
                <dt className="text-gray-500">{r.label}</dt>
                <dd className="text-gray-900"><Value label={r.label} value={r.value} /></dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
