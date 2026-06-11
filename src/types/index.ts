import type { CardRating } from '@/lib/sm2'

// Deck 类型
export interface DeckWithCount extends Deck {
  _count: { cards: number }
  dueCards?: number
}

export interface Deck {
  id: string
  name: string
  description: string | null
  color: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Card 类型
export interface CardWithDeck extends Card {
  deck: Pick<Deck, 'id' | 'name' | 'color'>
}

export interface Card {
  id: string
  front: string
  back: string
  tags: string[]
  deckId: string
  userId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
  lastReviewAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// 复习相关
export interface ReviewResult {
  cardId: string
  quality: CardRating
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

// 表单类型
export interface CreateDeckInput {
  name: string
  description?: string
  color?: string
}

export interface UpdateDeckInput {
  id: string
  name?: string
  description?: string
  color?: string
}

export interface CreateCardInput {
  front: string
  back: string
  tags?: string[]
  deckId: string
}

export interface UpdateCardInput {
  id: string
  front?: string
  back?: string
  tags?: string[]
}

// 统计类型
export interface StudyStats {
  totalCards: number
  dueCards: number
  studiedToday: number
  masteredCards: number // easeFactor >= 2.5 && interval >= 21
  totalStudyTime: number // minutes
  dailyActivity: { date: string; count: number }[]
}

// AI 生成
export interface AIGeneratedCard {
  front: string
  back: string
}

export interface AIGenerateInput {
  source: string
  sourceType: 'text' | 'url'
  deckId: string
}
