/**
 * SM-2 间隔重复算法
 *
 * 基于 SuperMemo SM-2 算法实现。
 * 用户评分标准：
 *   1 = Again  — 完全忘了
 *   2 = Hard   — 想起来了但很困难
 *   3 = Good   — 正常记住
 *   4 = Easy   — 非常轻松
 */

export interface SM2Input {
  quality: 1 | 2 | 3 | 4
  easeFactor: number
  interval: number
  repetitions: number
}

export interface SM2Output {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, easeFactor: oldEase, interval: oldInterval, repetitions: oldReps } = input

  let newEase: number
  let newInterval: number
  let newReps: number

  if (quality < 3) {
    // 答错或很困难 → 重置
    newReps = 0
    newInterval = 1
  } else {
    newReps = oldReps + 1

    if (newReps === 1) {
      newInterval = 1
    } else if (newReps === 2) {
      newInterval = 6
    } else {
      // 用 easeFactor 计算间隔
      newInterval = Math.round(oldInterval * oldEase)
    }
  }

  // 更新 easeFactor
  newEase = oldEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEase < 1.3) newEase = 1.3

  // 计算下次复习时间
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)
  nextReviewAt.setHours(0, 0, 0, 0) // 设为当天零点

  return {
    easeFactor: Math.round(newEase * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
    nextReviewAt,
  }
}

/**
 * 获取今日待复习卡片数量（含今天到期的卡片）
 */
export function isCardDueForReview(card: { nextReviewAt: Date }): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reviewDate = new Date(card.nextReviewAt)
  reviewDate.setHours(0, 0, 0, 0)
  return reviewDate <= today
}

/**
 * 卡片学习状态
 */
export type CardRating = 1 | 2 | 3 | 4

export const RATING_LABELS: Record<CardRating, { label: string; description: string; color: string }> = {
  1: { label: 'Again', description: '完全忘了', color: 'bg-red-500 hover:bg-red-600' },
  2: { label: 'Hard', description: '很困难', color: 'bg-orange-500 hover:bg-orange-600' },
  3: { label: 'Good', description: '正常记住', color: 'bg-green-500 hover:bg-green-600' },
  4: { label: 'Easy', description: '非常轻松', color: 'bg-blue-500 hover:bg-blue-600' },
}
