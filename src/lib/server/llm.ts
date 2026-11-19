// Server-only: asks a language model, through any provider that speaks the common "chat completions"
// format (Groq, Google Gemini, OpenRouter and others). It is switched on by three settings in Vercel:
//   AI_BASE_URL (for example https://api.groq.com/openai/v1), AI_API_KEY, AI_MODEL.
// Without them the assistant uses its prepared answers, so nothing breaks. Only the person's question
// and a few earlier lines are sent: never names, phones or details from a profile.

export const llmConfigured = () => !!(process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL)

/** The model's text, or null when it is not set up, busy (free plans have limits) or failed. */
export async function askModel(system: string, user: string): Promise<string | null> {
  const base = process.env.AI_BASE_URL?.replace(/\/+$/, '')
  const key = process.env.AI_API_KEY
  const model = process.env.AI_MODEL
  if (!base || !key || !model) return null
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 700,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      console.error('llm request failed:', res.status)
      return null
    }
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    return typeof text === 'string' ? text : null
  } catch (e) {
    console.error('llm error:', e instanceof Error ? e.message : e)
    return null
  }
}
