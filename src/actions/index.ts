'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { CreateDeckInput, UpdateDeckInput, CreateCardInput, CardRating } from '@/types'
import { calculateSM2 } from '@/lib/sm2'

// ============================================================
// 认证
// ============================================================

export async function registerUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: '该邮箱已注册' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  })

  return { success: true, userId: user.id }
}

// ============================================================
// Deck 操作
// ============================================================

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('未登录')
  return session.user.id
}

export async function createDeck(input: CreateDeckInput) {
  const userId = await getUserId()
  const deck = await prisma.deck.create({
    data: {
      name: input.name,
      description: input.description || null,
      color: input.color || '#6366f1',
      userId,
    },
  })
  revalidatePath('/dashboard/decks')
  return deck
}

export async function updateDeck(input: UpdateDeckInput) {
  const userId = await getUserId()
  const deck = await prisma.deck.update({
    where: { id: input.id, userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color !== undefined && { color: input.color }),
    },
  })
  revalidatePath('/dashboard/decks')
  revalidatePath(`/dashboard/decks/${deck.id}`)
  return deck
}

export async function deleteDeck(deckId: string) {
  const userId = await getUserId()
  await prisma.deck.delete({ where: { id: deckId, userId } })
  revalidatePath('/dashboard/decks')
}

export async function getDecks() {
  const userId = await getUserId()
  const decks = await prisma.deck.findMany({
    where: { userId },
    include: { _count: { select: { cards: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  // 计算每个卡组的待复习卡片数
  const now = new Date()
  const decksWithDue = await Promise.all(
    decks.map(async (deck) => {
      const dueCards = await prisma.card.count({
        where: {
          deckId: deck.id,
          userId,
          nextReviewAt: { lte: now },
        },
      })
      return { ...deck, dueCards }
    })
  )

  return decksWithDue
}

export async function getDeck(deckId: string) {
  const userId = await getUserId()
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: { _count: { select: { cards: true } } },
  })
  if (!deck) throw new Error('卡组不存在')
  return deck
}

// ============================================================
// Card 操作
// ============================================================

// Helper: 反序列化 tags（MySQL 下存的是 JSON 字符串）
function parseCard(card: any) {
  if (typeof card.tags === 'string') {
    try { card.tags = JSON.parse(card.tags) } catch { card.tags = [] }
  }
  return card
}

export async function createCard(input: CreateCardInput) {
  const userId = await getUserId()
  const card = await prisma.card.create({
    data: {
      front: input.front,
      back: input.back,
      tags: JSON.stringify(input.tags || []),
      deckId: input.deckId,
      userId,
    },
  })
  revalidatePath(`/dashboard/decks/${input.deckId}`)
  return parseCard(card)
}

export async function updateCard(input: { id: string; front?: string; back?: string; tags?: string[] }) {
  const userId = await getUserId()
  const card = await prisma.card.findFirst({ where: { id: input.id, userId } })
  if (!card) throw new Error('卡片不存在')

  const updated = await prisma.card.update({
    where: { id: input.id },
    data: {
      ...(input.front !== undefined && { front: input.front }),
      ...(input.back !== undefined && { back: input.back }),
      ...(input.tags !== undefined && { tags: JSON.stringify(input.tags) }),
    },
  })
  revalidatePath(`/dashboard/decks/${updated.deckId}`)
  return parseCard(updated)
}

export async function deleteCard(cardId: string) {
  const userId = await getUserId()
  const card = await prisma.card.findFirst({ where: { id: cardId, userId } })
  if (!card) throw new Error('卡片不存在')
  await prisma.card.delete({ where: { id: cardId } })
  revalidatePath(`/dashboard/decks/${card.deckId}`)
}

export async function getCards(deckId: string) {
  const userId = await getUserId()
  const cards = await prisma.card.findMany({
    where: { deckId, userId },
    orderBy: { createdAt: 'desc' },
  })
  return cards.map(parseCard)
}

export async function getDueCards(deckId?: string) {
  const userId = await getUserId()
  const now = new Date()
  const where: any = {
    userId,
    nextReviewAt: { lte: now },
  }
  if (deckId) where.deckId = deckId

  const cards = await prisma.card.findMany({
    where,
    include: { deck: { select: { id: true, name: true, color: true } } },
    orderBy: [{ easeFactor: 'asc' }, { nextReviewAt: 'asc' }],
  })
  return cards.map(parseCard)
}

// ============================================================
// 复习操作
// ============================================================

export async function submitReview(cardId: string, quality: CardRating) {
  const userId = await getUserId()

  const card = await prisma.card.findFirst({ where: { id: cardId, userId } })
  if (!card) throw new Error('卡片不存在')

  // 计算 SM-2 结果
  const result = calculateSM2({
    quality,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
  })

  // 更新卡片
  await prisma.card.update({
    where: { id: cardId },
    data: {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewAt: result.nextReviewAt,
      lastReviewAt: new Date(),
    },
  })

  // 记录复习日志
  await prisma.reviewLog.create({
    data: {
      cardId,
      userId,
      quality,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
    },
  })

  return result
}

// ============================================================
// 学习会话
// ============================================================

export async function startStudySession(deckId?: string) {
  const userId = await getUserId()
  const session = await prisma.studySession.create({
    data: { userId, deckId: deckId || null },
  })
  return session
}

export async function endStudySession(sessionId: string, cardsStudied: number, correctCount: number) {
  const userId = await getUserId()
  const session = await prisma.studySession.findFirst({ where: { id: sessionId, userId } })
  if (!session) throw new Error('学习会话不存在')

  const duration = session.startedAt
    ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
    : 0

  await prisma.studySession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      cardsStudied,
      correctCount,
      duration,
    },
  })
}

// ============================================================
// 统计
// ============================================================

export async function getStudyStats(userId?: string) {
  if (!userId) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('未登录')
    userId = session.user.id
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const [
    totalCards,
    dueCards,
    studiedToday,
    reviewLogs,
    totalStudyTime,
  ] = await Promise.all([
    prisma.card.count({ where: { userId } }),
    prisma.card.count({ where: { userId, nextReviewAt: { lte: now } } }),
    prisma.reviewLog.count({
      where: { userId, reviewedAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.reviewLog.groupBy({
      by: ['reviewedAt'],
      where: { userId },
      _count: { id: true },
    }),
    prisma.studySession.aggregate({
      where: { userId, duration: { not: null } },
      _sum: { duration: true },
    }),
  ])

  // 已完成卡片（easeFactor >= 2.5 && interval >= 21）
  const masteredCards = await prisma.card.count({
    where: { userId, easeFactor: { gte: 2.5 }, interval: { gte: 21 } },
  })

  // 每日活动量（近 30 天）
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const dailyLogs = await prisma.reviewLog.findMany({
    where: { userId, reviewedAt: { gte: thirtyDaysAgo } },
    select: { reviewedAt: true },
    orderBy: { reviewedAt: 'asc' },
  })

  // 按日期聚合
  const dailyMap = new Map<string, number>()
  dailyLogs.forEach((log) => {
    const dateStr = log.reviewedAt.toISOString().split('T')[0]
    dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1)
  })

  const dailyActivity = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  return {
    totalCards,
    dueCards,
    studiedToday,
    masteredCards,
    totalStudyTime: Math.round((totalStudyTime._sum.duration || 0) / 60),
    dailyActivity,
  }
}
