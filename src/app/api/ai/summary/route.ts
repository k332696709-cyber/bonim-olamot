import { NextRequest, NextResponse } from 'next/server'

interface SummaryRequest {
  aboutMe: string
  aboutPartner: string
  name: string
  gender: 'male' | 'female'
  locale: 'he' | 'en'
  style: string
  traits: string[]
  relationshipValues: string[]
  brings: string[]
  doesntSuit?: string
}

// Structured fallback when no AI key or text is empty
function generateStructuredBullets(body: SummaryRequest): string[] {
  const { name, gender, style, traits, relationshipValues, brings, doesntSuit, locale } = body
  const he = locale === 'he'
  const genderWord = he
    ? (gender === 'female' ? 'בחורה' : 'בחור')
    : (gender === 'female' ? 'Female candidate' : 'Male candidate')

  const styleMap: Record<string, string> = {
    yeshivish: he ? 'ישיבתי' : 'Yeshivish',
    open_ish:  he ? 'פתוח/ה במידה' : 'Open-ish',
    open:      he ? 'פתוח/ה' : 'Open',
    modern:    he ? 'מודרני/ת' : 'Modern',
    very_modern: he ? 'מודרני/ת מאוד' : 'Very Modern',
    shmura:    he ? 'שמורה' : 'Shmura',
  }

  const bullets: string[] = []

  // Bullet 1: identity
  bullets.push(he
    ? `${genderWord} בסגנון ${styleMap[style] ?? style} עם אישיות: ${traits.join(', ')}`
    : `${genderWord} with a ${styleMap[style] ?? style} lifestyle and ${traits.join(', ')} personality`,
  )

  // Bullet 2: relationship values
  if (relationshipValues.length > 0) {
    bullets.push(he
      ? `מחפש/ת ערכים של: ${relationshipValues.join(', ')}`
      : `Seeking a relationship built on: ${relationshipValues.join(', ')}`,
    )
  }

  // Bullet 3: what they bring
  if (brings.length > 0) {
    bullets.push(he
      ? `מביא/ה לזוגיות: ${brings.join(', ')}`
      : `Brings to the marriage: ${brings.join(', ')}`,
    )
  }

  // Bullet 4: doesntSuit if present
  if (doesntSuit && doesntSuit.trim()) {
    bullets.push(he
      ? `חשוב לדעת: ${doesntSuit.trim()}`
      : `Important to note: ${doesntSuit.trim()}`,
    )
  }

  return bullets.slice(0, 4)
}

export async function POST(req: NextRequest) {
  const body: SummaryRequest = await req.json()

  const apiKey = process.env.ANTHROPIC_API_KEY

  // Use AI if both API key and meaningful text are available
  if (apiKey && (body.aboutMe?.trim() || body.aboutPartner?.trim())) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })

      const genderWord = body.gender === 'female' ? 'בחורה' : 'בחור'
      const langInstruction = body.locale === 'he'
        ? 'ענה בעברית בלבד.'
        : 'Answer in English only.'

      const prompt = `אתה עוזר שדכנות מנוסה במערכת שידוכים אורתודוקסית.
${langInstruction}

קבל מידע על מועמד/ת וצור 3-4 נקודות תמציתיות לשדכן.
התמקד ב: אישיות, מה מחפש/ת, כיוון דתי/חיים.
כל נקודה: משפט אחד קצר. אין כותרות, אין מספרים. החזר JSON: {"bullets": ["...","...","..."]}.

פרטי ${genderWord}:
אודות עצמי: ${body.aboutMe || '—'}
מה מחפש/ת: ${body.aboutPartner || '—'}
סגנון: ${body.style}
תכונות: ${body.traits.join(', ')}
ערכים: ${body.relationshipValues.join(', ')}
מביא/ה: ${body.brings.join(', ')}${body.doesntSuit ? `\nלא מתאים: ${body.doesntSuit}` : ''}`

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
          return NextResponse.json({ bullets: parsed.bullets.slice(0, 4), source: 'ai' })
        }
      }
    } catch {
      // fall through to structured fallback
    }
  }

  const bullets = generateStructuredBullets(body)
  return NextResponse.json({ bullets, source: 'structured' })
}
