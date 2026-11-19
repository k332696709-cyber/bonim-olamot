// Finds the prepared answer that fits a question about dating or shidduchim, and recognises when
// someone is asking for places to go on a date. No outside service is involved.
import { KNOWLEDGE, RABBI_NOTE, TOPIC_CHIPS, type KnowledgeEntry, type KnowledgeSource } from '@/constants/shidduchKnowledge'

const clean = (s: string) => s.toLowerCase().replace(/[֑-ׇ]/g, '').replace(/["'׳״.,!?;:()]/g, ' ').replace(/\s+/g, ' ').trim()

export function findAnswer(message: string): { entry: KnowledgeEntry; score: number } | null {
  const text = clean(message)
  let best: { entry: KnowledgeEntry; score: number } | null = null
  for (const entry of KNOWLEDGE) {
    let score = 0
    for (const raw of entry.keywords) {
      const k = clean(raw)
      if (!k || !text.includes(k)) continue
      // A longer phrase says more about what is being asked than a single word does.
      const words = k.split(' ').length
      score += words > 1 ? words * 2 : k.length >= 5 ? 2 : 1
    }
    if (score >= 2 && (!best || score > best.score)) best = { entry, score }
  }
  return best
}

/** True when someone asks where to go on a date (as opposed to a general question about dating). */
export function isDatePlacesQuestion(message: string): boolean {
  const t = clean(message)
  const place = /(מקומות?|איפה|לאן|מסעדה|מסעדות|פארק|לובי|בית קפה|קפה)/.test(t)
  const date = /(דייט|דייטים|פגישה|פגישות|לצאת|להיפגש|נפגשים|שידוך)/.test(t)
  return place && date
}

export function withNote(entry: KnowledgeEntry): string {
  return entry.rabbi ? `${entry.answer}\n\n${RABBI_NOTE}` : entry.answer
}

export function helpText(): string {
  return `אפשר לשאול אותי על דייטים ושידוכים, למשל: ${TOPIC_CHIPS.map((c) => `"${c}"`).join(', ')}. אפשר גם לדייק את ההצעות: עיר, טווח גילאים או סגנון. לשאלות הלכתיות מומלץ לפנות לרב.`
}

export function sourcesOf(entry: KnowledgeEntry): KnowledgeSource[] {
  return entry.sources
}
