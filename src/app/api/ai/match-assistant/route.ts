import { NextRequest, NextResponse } from 'next/server'
import { describePrefs, parseLocal, type Prefs } from '@/lib/matchmaking/assistant'
import { findAnswer, helpText, isDatePlacesQuestion, withNote } from '@/lib/assistant/answer'
import { cityCoords, distanceKm } from '@/constants/cityCoords'
import { fetchPublishedSpots } from '@/lib/dateSpots'
import { askModel, llmConfigured } from '@/lib/server/llm'
import { KNOWLEDGE, RABBI_NOTE } from '@/constants/shidduchKnowledge'
import { GROUP_LABELS } from '@/lib/matchmaking/preferences'

/** The open conversation: a language model that leans on the prepared answers. Null if it is off or fails. */
async function openAnswer(message: string, history: string, cities: string[], current: Prefs) {
  if (!llmConfigured()) return null
  const knowledge = KNOWLEDGE.map((k) => `[${k.id}] ${k.title}: ${k.answer}`).join('\n')
  const system = `את/ה העוזר/ת החכם/ה באתר שידוכים לקהילה החרדית (בונים עולמות). ענה/י בעברית, בטון מכבד וחם, בקצרה (עד חמישה משפטים).
אפשר לענות על כל שאלה בנושא שידוכים, דייטים, היכרות, זוגיות ותקשורת. התבסס/י קודם על החומר המוכן שלמטה, ואם אין בו תשובה אפשר לתת עצה כללית וסבירה ולהגיד שהיא כללית.
אל תפסוק/י הלכה: בשאלות הלכתיות הפנה/י לרב. אל תבקש/י ואל תחשוף/י שמות, טלפונים או פרטים אישיים. אל תבטיח/י שידוך.
אם המשתמש מבקש לדייק או לסנן את ההצעות (עיר, טווח גילאים, סגנון, מוצא או קהילה), החזר/י את מסנן ההצעות המלא החדש ב-prefs, אחרת החזר/י prefs כמו שהוא.
ערים אפשריות: ${cities.join(', ') || 'אין'}.
קבוצות אפשריות למוצא או קהילה: ${Object.entries(GROUP_LABELS).map(([id, l]) => `${id}=${l}`).join(', ')}.
המסנן הנוכחי: ${JSON.stringify(current)}.
חומר מוכן:
${knowledge}

החזר/י אך ורק JSON בצורה: {"reply": string, "prefs": {"city": string|null, "minAge": number|null, "maxAge": number|null, "styleShift": "more_open"|"more_conservative"|null, "groups": string[]|null, "notGroups": string[]|null}, "sourceIds": string[]}
ב-sourceIds רשמ/י רק מזהים מהחומר המוכן שבאמת השתמשת בהם.`
  const text = await askModel(system, `${history ? history + '\n' : ''}משתמש: ${message}`)
  const match = text?.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0])
    if (typeof parsed.reply !== 'string' || !parsed.reply.trim()) return null
    const ids: string[] = Array.isArray(parsed.sourceIds) ? parsed.sourceIds.map(String) : []
    const used = KNOWLEDGE.filter((k) => ids.includes(k.id))
    const sources = used.flatMap((k) => k.sources).filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i).slice(0, 5)
    const rabbi = used.some((k) => k.rabbi) && !parsed.reply.includes('רב')
    return { reply: (parsed.reply.trim() + (rabbi ? `\n\n${RABBI_NOTE}` : '')).slice(0, 1200), prefs: parsed.prefs, sources }
  } catch {
    return null
  }
}

/** Date places near a city: the closest kosher ones in the list, with a link to each. */
async function datePlaces(city: string | null | undefined) {
  const spots = (await fetchPublishedSpots()).filter((s) => s.kosher !== false)
  const from = cityCoords(city)
  if (!from) return { reply: 'כדי להציע מקומות קרובים צריך לדעת באיזו עיר אתם גרים. אפשר לכתוב לי עיר, או לעיין ברשימה המלאה בעמוד "מקומות לדייטים".', sources: [{ title: 'כל המקומות לדייטים', url: '/he/date-spots' }] }
  const near = spots
    .map((s) => ({ s, c: cityCoords(s.city) }))
    .filter((x): x is { s: typeof spots[number]; c: [number, number] } => !!x.c)
    .map((x) => ({ s: x.s, km: Math.round(distanceKm(from, x.c)) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 5)
  if (near.length === 0) return { reply: 'עדיין אין ברשימה מקומות קרובים. אפשר לעיין בכל המקומות בעמוד "מקומות לדייטים".', sources: [{ title: 'כל המקומות לדייטים', url: '/he/date-spots' }] }
  return {
    reply: `אלה מקומות לדייט הקרובים ל${city}. מקומות ציבוריים או חצי ציבוריים מתאימים לפגישה ראשונה. כשיש עניין הדדי אפשר לראות גם מקומות באמצע בין שני הגרים.`,
    sources: near.map(({ s, km }) => ({ title: `${s.name} · ${s.city} (כ-${km} ק״מ)`, url: s.googleMapsUrl || '/he/date-spots' })),
  }
}

interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

interface AssistantRequest {
  message: string
  locale: 'he' | 'en'
  history?: ChatTurn[]
  cities: string[]
  current: Prefs
  /** Short, anonymous description of the candidate asking (no contact details). */
  me: { age: number; city: string; style: string }
}

const MAX_MESSAGE = 500

const GROUP_IDS = new Set(Object.keys(GROUP_LABELS))
function sanitizeGroups(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out = v.map(String).filter((g) => GROUP_IDS.has(g))
  return out.length ? out : null
}

function sanitizePrefs(raw: unknown, cities: string[]): Prefs {
  const p = (raw ?? {}) as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' && v >= 18 && v <= 80 ? Math.round(v) : null)
  const shift = p.styleShift === 'more_open' || p.styleShift === 'more_conservative' ? p.styleShift : null
  const city = typeof p.city === 'string' && cities.includes(p.city) ? p.city : null
  return { city, minAge: num(p.minAge), maxAge: num(p.maxAge), styleShift: shift, groups: sanitizeGroups(p.groups), notGroups: sanitizeGroups(p.notGroups) }
}

export async function POST(req: NextRequest) {
  let body: AssistantRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const he = body.locale !== 'en'
  const message = (body.message ?? '').toString().slice(0, MAX_MESSAGE).trim()
  const cities = Array.isArray(body.cities) ? body.cities.slice(0, 40) : []
  if (!message) return NextResponse.json({ error: 'empty' }, { status: 400 })

  // Questions about dating, tips and places get a prepared answer with its sources.
  const asked = parseLocal(message, cities)
  const filterWords = asked.minAge != null || asked.maxAge != null
  if (isDatePlacesQuestion(message)) {
    const named = cities.find((c) => message.includes(c))
    const out = await datePlaces(named || body.me?.city)
    return NextResponse.json({ reply: out.reply, prefs: body.current ?? {}, sources: out.sources, source: 'knowledge' })
  }
  // An open conversation with a language model, when one is connected (free plans have limits, so a
  // failure falls through to the prepared answers).
  const history = (body.history ?? []).slice(-4).map((t) => `${t.role === 'user' ? 'משתמש' : 'עוזר'}: ${String(t.text).slice(0, 250)}`).join('\n')
  const open = await openAnswer(message, history, cities, body.current ?? {})
  if (open) {
    return NextResponse.json({ reply: open.reply, prefs: sanitizePrefs(open.prefs, cities), sources: open.sources, source: 'ai' })
  }

  const known = findAnswer(message)
  if (known && !filterWords) {
    return NextResponse.json({ reply: withNote(known.entry), prefs: body.current ?? {}, sources: known.entry.sources, source: 'knowledge' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (apiKey) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })

      const history = (body.history ?? [])
        .slice(-6)
        .map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${String(t.text).slice(0, 300)}`)
        .join('\n')

      const prompt = `You are a warm, discreet assistant inside an Orthodox Jewish matchmaking service.
${he ? 'Reply in Hebrew only.' : 'Reply in English only.'}
The user is refining the match suggestions shown to them. Never ask for or reveal names, phone numbers or other contact details.
Never promise a match; you only help narrow suggestions.

Available cities: ${cities.join(', ') || 'none'}
Current filters: ${JSON.stringify(body.current ?? {})}
The user: age ${body.me?.age}, city ${body.me?.city}, style ${body.me?.style}

Conversation so far:
${history || '(none)'}
User: ${message}

Return ONLY JSON: {"reply": "1-2 short friendly sentences confirming what you changed or asking one clarifying question", "prefs": {"city": string|null, "minAge": number|null, "maxAge": number|null, "styleShift": "more_open"|"more_conservative"|null}}.
"prefs" is the FULL new filter set (keep unchanged fields from the current filters; clear them only if the user asks). city must be one of the available cities or null.`

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (typeof parsed.reply === 'string') {
          return NextResponse.json({
            reply: parsed.reply.slice(0, 400),
            prefs: sanitizePrefs(parsed.prefs, cities),
            source: 'ai',
          })
        }
      }
    } catch {
      // fall through to the rule-based assistant
    }
  }

  // Rule-based fallback: merge what we could read into the current filters.
  const found = parseLocal(message, cities)
  const reset = found.city === null && found.minAge === null && found.maxAge === null && found.styleShift === null
  const next: Prefs = reset ? found : { ...(body.current ?? {}), ...found }
  const summary = describePrefs(next, he)

  let reply: string
  if (reset) {
    reply = he ? 'ניקיתי את הסינון. אלו כל ההצעות שמתאימות לך.' : 'Filters cleared. Here are all the suggestions that fit you.'
  } else if (Object.keys(found).length === 0) {
    reply = he
      ? `לא מצאתי לזה תשובה בחומר שלי. ${helpText()}`
      : 'I didn’t quite get that. Try a city, an age range or a style, e.g. “from Jerusalem, up to 27, a bit more open”.'
  } else {
    reply = he ? `עדכנתי את ההצעות: ${summary}.` : `Updated your suggestions: ${summary}.`
  }

  return NextResponse.json({ reply, prefs: next, source: 'rules' })
}
