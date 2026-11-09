import { NextRequest, NextResponse } from 'next/server'
import { BOT_ACTIONS, BOT_FACTS_EN, BOT_FACTS_HE, ruleReply, type BotAction } from '@/lib/bot/botRules'

interface Turn { role: 'user' | 'bot'; text: string }

const MAX_MESSAGE = 400

// Best-effort per-instance rate limit (serverless instances do not share memory).
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 500) hits.clear()
  return recent.length > 15
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let body: { message?: string; locale?: string; history?: Turn[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const he = body.locale !== 'en'
  const message = String(body.message ?? '').slice(0, MAX_MESSAGE).trim()
  if (!message) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (apiKey) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })

      const history = (body.history ?? [])
        .slice(-6)
        .map((t) => `${t.role === 'user' ? 'User' : 'Bot'}: ${String(t.text).slice(0, 250)}`)
        .join('\n')

      const prompt = `You are the friendly, discreet assistant of "Bonim Olamot" (בונים עולמות), an Orthodox Jewish matchmaking organization.
${he ? 'Reply in Hebrew only.' : 'Reply in English only.'}
Use gender-neutral phrasing toward the user (e.g. "מחפש/ת") until they say who they are.
Answer ONLY from these facts. If asked something outside them, say you don't know and suggest the Contact page. Never invent prices, names, phone numbers, success rates or promises of a match. Never ask for personal details in the chat (the form collects them).
Keep replies to 1-3 short sentences.

FACTS:
${he ? BOT_FACTS_HE : BOT_FACTS_EN}

Choose an "action":
- "form_male": the user is a man/boy looking for a match, or asks for the men's registration form
- "form_female": the user is a woman/girl looking for a match, or asks for the women's registration form
- "form_matchmaker": the user is a matchmaker who wants to join
- "contact": the user wants to talk to a person, or asks about something you cannot answer (e.g. price)
- null: just an answer. If the user wants to register but has not said whether they are a man or a woman, use null and ask which.

Conversation so far:
${history || '(none)'}
User: ${message}

Return ONLY JSON: {"reply": "...", "action": "form_male"|"form_female"|"form_matchmaker"|"contact"|null}`

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const m = text.match(/\{[\s\S]*\}/)
      if (m) {
        const parsed = JSON.parse(m[0])
        const action: BotAction = BOT_ACTIONS.includes(parsed.action) ? parsed.action : null
        if (typeof parsed.reply === 'string' && parsed.reply.trim()) {
          return NextResponse.json({ reply: parsed.reply.slice(0, 500), action, source: 'ai' })
        }
      }
    } catch {
      // fall through to the rule-based bot
    }
  }

  return NextResponse.json({ ...ruleReply(message, he), source: 'rules' })
}
