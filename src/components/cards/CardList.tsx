'use client'

import { useState } from 'react'
import { createCard, deleteCard } from '@/actions'
import type { Card } from '@/types'
import { timeAgo } from '@/lib/utils'

interface CardListProps {
  cards: Card[]
  deckId: string
}

export default function CardList({ cards, deckId }: CardListProps) {
  const [showForm, setShowForm] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    setLoading(true)
    await createCard({
      front: front.trim(),
      back: back.trim(),
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      deckId,
    })
    setFront('')
    setBack('')
    setTags('')
    setLoading(false)
    setShowForm(false)
  }

  async function handleDelete(cardId: string) {
    if (!confirm('确定删除这张卡片？')) return
    await deleteCard(cardId)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">卡片列表</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white text-sm font-medium transition"
        >
          {showForm ? '取消' : '+ 添加卡片'}
        </button>
      </div>

      {/* Add card form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">正面（问题/术语）</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="例如：React 中的 useState 是什么？"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">背面（答案/解释）</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="例如：useState 是 React 的一个 Hook，用于在函数组件中添加状态管理..."
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">标签（选填，用逗号隔开）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="React, Hooks"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition"
          >
            {loading ? '添加中...' : '添加卡片'}
          </button>
        </form>
      )}

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🃏</div>
          <p className="text-slate-500 text-sm">这个卡组还没有卡片，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{card.front}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{card.back}</p>
                  {card.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-slate-500">
                    {timeAgo(card.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 transition"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
