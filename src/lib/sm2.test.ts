import { describe, it, expect } from 'vitest'
import { calculateSM2, isCardDueForReview } from './sm2'

describe('calculateSM2', () => {
  // 初始卡片状态
  const freshCard = { easeFactor: 2.5, interval: 0, repetitions: 0 }

  it('Again(1) 重置间隔为 1 天', () => {
    const result = calculateSM2({ quality: 1, ...freshCard })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('Hard(2) 重置间隔为 1 天', () => {
    const result = calculateSM2({ quality: 2, ...freshCard })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('Good(3) 首次复习间隔为 1 天', () => {
    const result = calculateSM2({ quality: 3, ...freshCard })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('Easy(4) 首次复习间隔为 1 天', () => {
    const result = calculateSM2({ quality: 4, ...freshCard })
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(1)
  })

  it('Good(3) 第二次复习间隔为 6 天', () => {
    const result = calculateSM2({ quality: 3, easeFactor: 2.5, interval: 1, repetitions: 1 })
    expect(result.interval).toBe(6)
    expect(result.repetitions).toBe(2)
  })

  it('连续 Good 第三次复习间隔按 easeFactor 增长', () => {
    const result = calculateSM2({ quality: 3, easeFactor: 2.5, interval: 6, repetitions: 2 })
    // interval = round(6 * 2.5) = 15
    expect(result.interval).toBe(15)
    expect(result.repetitions).toBe(3)
  })

  it('Easy(4) 提高 easeFactor', () => {
    const result = calculateSM2({ quality: 4, easeFactor: 2.5, interval: 6, repetitions: 2 })
    // easeFactor = 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02)) = 2.5 + (0.1 - 0.1) = 2.5
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5)
    expect(result.interval).toBeGreaterThan(6)
  })

  it('Again(1) 降低 easeFactor 并重置间隔', () => {
    const result = calculateSM2({ quality: 1, easeFactor: 2.5, interval: 15, repetitions: 3 })
    expect(result.easeFactor).toBeLessThan(2.5)
    expect(result.interval).toBe(1)
    expect(result.repetitions).toBe(0)
  })

  it('easeFactor 不会低于 1.3', () => {
    const result = calculateSM2({ quality: 1, easeFactor: 1.3, interval: 1, repetitions: 0 })
    expect(result.easeFactor).toBe(1.3)
  })

  it('计算后续复习日期在当天之后', () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const result = calculateSM2({ quality: 3, easeFactor: 2.5, interval: 6, repetitions: 2 })
    expect(result.nextReviewAt.getTime()).toBeGreaterThanOrEqual(now.getTime() + 14 * 86400000)
  })
})

describe('isCardDueForReview', () => {
  it('今天到期的卡片应该待复习', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expect(isCardDueForReview({ nextReviewAt: today })).toBe(true)
  })

  it('昨天的卡片应该待复习', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    expect(isCardDueForReview({ nextReviewAt: yesterday })).toBe(true)
  })

  it('明天的卡片不应该待复习', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    expect(isCardDueForReview({ nextReviewAt: tomorrow })).toBe(false)
  })
})
