import { NextRequest, NextResponse } from 'next/server'
import {
  TRAIT_OPTIONS_MALE, TRAIT_OPTIONS_FEMALE, RELATIONSHIP_VALUES_MALE, RELATIONSHIP_VALUES_FEMALE, BRINGS_MALE, BRINGS_FEMALE,
} from '@/constants/formOptions'

/** Turns stored codes such as "stability" into their Hebrew (or English) names. */
function names(list: { value: string; he: string; en: string }[], values: string[], he: boolean): string {
  return values.map((v) => { const o = list.find((x) => x.value === v); return o ? (he ? o.he : o.en) : v }).join(', ')
}

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

  const f = gender === 'female'
  const styleMap: Record<string, string> = {
    yeshivish: he ? 'ישיבתי' : 'Yeshivish',
    open_ish:  he ? (f ? 'פתוחה במידה' : 'פתוח במידה') : 'Open-ish',
    open:      he ? (f ? 'פתוחה' : 'פתוח') : 'Open',
    modern:    he ? (f ? 'מודרנית' : 'מודרני') : 'Modern',
    very_modern: he ? (f ? 'מודרנית מאוד' : 'מודרני מאוד') : 'Very Modern',
    shmura:    he ? 'שמורה' : 'Shmura',
  }

  const female = gender === 'female'
  const traitList = female ? TRAIT_OPTIONS_FEMALE : TRAIT_OPTIONS_MALE
  const valueList = female ? RELATIONSHIP_VALUES_FEMALE : RELATIONSHIP_VALUES_MALE
  const bringList = female ? BRINGS_FEMALE : BRINGS_MALE
  const traitText = names(traitList, traits, he)
  const valueText = names(valueList, relationshipValues, he)
  const bringText = names(bringList, brings, he)

  const bullets: string[] = []

  bullets.push(he
    ? `${genderWord} בסגנון ${styleMap[style] ?? style}${traitText ? `, עם אישיות ${traitText}` : ''}`
    : `${genderWord} with a ${styleMap[style] ?? style} lifestyle${traitText ? ` and a ${traitText} personality` : ''}`,
  )

  if (valueText) {
    bullets.push(he ? `מחפש/ת זוגיות שמבוססת על: ${valueText}` : `Seeking a relationship built on: ${valueText}`)
  }

  if (bringText) {
    bullets.push(he ? `מביא/ה לזוגיות: ${bringText}` : `Brings to the marriage: ${bringText}`)
  }

  // What the person wrote that does not suit them: their own words, so it is labelled as such.
  if (doesntSuit && doesntSuit.trim()) {
    bullets.push(he
      ? `לפי מה שכתב/ה, לא מתאים: ${doesntSuit.trim()}`
      : `Wrote that this does not suit them: ${doesntSuit.trim()}`,
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
