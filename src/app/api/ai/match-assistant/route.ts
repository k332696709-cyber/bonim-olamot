import { NextRequest, NextResponse } from 'next/server'
import { describePrefs, parseLocal, type Prefs } from '@/lib/matchmaking/assistant'

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

function sanitizePrefs(raw: unknown, cities: string[]): Prefs {
  const p = (raw ?? {}) as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' && v >= 18 && v <= 80 ? Math.round(v) : null)
  const shift = p.styleShift === 'more_open' || p.styleShift === 'more_conservative' ? p.styleShift : null
  const city = typeof p.city === 'string' && cities.includes(p.city) ? p.city : null
  return { city, minAge: num(p.minAge), maxAge: num(p.maxAge), styleShift: shift }
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
      ? 'לא לגמרי הבנתי. אפשר לבקש עיר, טווח גילאים או סגנון, למשל "מירושלים, עד גיל 27, קצת יותר פתוחה".'
      : 'I didn’t quite get that. Try a city, an age range or a style, e.g. “from Jerusalem, up to 27, a bit more open”.'
  } else {
    reply = he ? `עדכנתי את ההצעות: ${summary}.` : `Updated your suggestions: ${summary}.`
  }

  return NextResponse.json({ reply, prefs: next, source: 'rules' })
}
