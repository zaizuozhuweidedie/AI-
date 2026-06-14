'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submitReview, startStudySession, endStudySession } from '@/actions'
import { RATING_LABELS, type CardRating } from '@/lib/sm2'
import type { CardWithDeck, DeckWithCount } from '@/types'

interface StudyViewProps {
  cards: CardWithDeck[]
  decks?: DeckWithCount[]
}

export default function StudyView({ cards: initialCards, decks }: StudyViewProps) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: initialCards.length, studied: 0, correct: 0 })
  const [selectedDeck, setSelectedDeck] = useState<string>('all')
  const [finished, setFinished] = useState(false)

  const currentCard = cards[currentIndex]
  const hasCards = cards.length > 0 && !finished

  useEffect(() => {
    if (initialCards.length > 0) {
      startStudySession(selectedDeck !== 'all' ? selectedDeck : undefined).then((s) =>
        setSessionId(s.id)
      )
    }
  }, [])

  useEffect(() => {
    return () => {
      if (sessionId) {
        endStudySession(sessionId, stats.studied, stats.correct)
      }
    }
  }, [sessionId, stats.studied, stats.correct])

  const handleReview = useCallback(
    async (quality: CardRating) => {
      if (!currentCard || isSubmitting) return
      setIsSubmitting(true)
      try {
        await submitReview(currentCard.id, quality)
        const isCorrect = quality >= 3
        setStats((prev) => ({ ...prev, studied: prev.studied + 1, correct: prev.correct + (isCorrect ? 1 : 0) }))
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((i) => i + 1)
          setFlipped(false)
        } else {
          setFinished(true)
          if (sessionId) {
            await endStudySession(sessionId, stats.studied + 1, stats.correct + (isCorrect ? 1 : 0))
          }
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentCard, currentIndex, cards.length, isSubmitting, sessionId, stats]
  )

  useEffect(() => {
    if (!flipped) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === '1') handleReview(1)
      if (e.key === '2') handleReview(2)
      if (e.key === '3') handleReview(3)
      if (e.key === '4') handleReview(4)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, handleReview])

  function filterByDeck(deckId: string) {
    setSelectedDeck(deckId)
    if (deckId === 'all') setCards(initialCards)
    else setCards(initialCards.filter((c) => c.deck.id === deckId))
    setCurrentIndex(0)
    setFlipped(false)
    setFinished(false)
    setStats({ total: initialCards.length, studied: 0, correct: 0 })
  }

  if (initialCards.length === 0) {
    return (
      <div className="border border-gray-200 rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">没有待复习的卡片</h2>
        <p className="text-gray-500 mb-6">所有卡片都已复习完毕，或者还没有创建卡片</p>
        <button
          onClick={() => router.push('/dashboard/decks/new')}
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition"
        >
          创建卡组
        </button>
      </div>
    )
  }

  if (finished) {
    const accuracy = stats.studied > 0 ? Math.round((stats.correct / stats.studied) * 100) : 0
    return (
      <div className="border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">复习完成！</h2>
        <p className="text-gray-500 mb-6">本轮复习到此结束</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.studied}</p>
            <p className="text-xs text-gray-500">已复习</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-xs text-gray-500">正确率</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{cards.length}</p>
            <p className="text-xs text-gray-500">总卡片</p>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition"
          >
            继续下一轮
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg text-gray-700 transition"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学习</h1>
          <p className="text-sm text-gray-500">{currentIndex + 1} / {stats.total} · 已复习 {stats.studied} 张</p>
        </div>
        {decks && decks.length > 0 && (
          <select
            value={selectedDeck}
            onChange={(e) => filterByDeck(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">全部卡组</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-gray-900 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(currentIndex / stats.total) * 100}%` }} />
      </div>

      <div className="perspective">
        <div
          className="relative rounded-2xl min-h-[300px] cursor-pointer shadow-md"
          style={{ backgroundColor: currentCard.deck.color || '#e5e7eb' }}
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-opacity duration-300 ${flipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="text-sm text-white/70 mb-3">{currentCard.deck.name}</div>
            <p className="text-xl text-white text-center leading-relaxed max-w-lg">{currentCard.front}</p>
            <p className="text-sm text-white/60 mt-8">点击翻转查看答案</p>
          </div>
          <div className={`p-8 flex flex-col items-center justify-center min-h-[300px] transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="text-sm text-white/70 mb-3">答案</div>
            <p className="text-lg text-white text-center leading-relaxed max-w-lg whitespace-pre-wrap">{currentCard.back}</p>
            {currentCard.tags.length > 0 && (
              <div className="flex gap-1 mt-4">
                {currentCard.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-white/20 text-white/80 rounded text-[10px]">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-sm text-gray-500 text-center mb-3">你觉得这张卡片掌握得怎么样？</p>
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(RATING_LABELS) as [string, typeof RATING_LABELS[1]][]).map(([key, rating]) => (
            <button
              key={key}
              onClick={() => handleReview(Number(key) as CardRating)}
              disabled={isSubmitting}
              className={`${rating.color} text-white rounded-xl py-3 px-2 text-center transition disabled:opacity-50 shadow-sm`}
            >
              <div className="font-semibold text-sm">{rating.label}</div>
              <div className="text-[10px] opacity-80">{rating.description}</div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">按键盘 1-4 快速评分</p>
      </div>
    </div>
  )
}
