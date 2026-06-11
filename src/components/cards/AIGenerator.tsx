'use client'

import { useState } from 'react'
import { createCard } from '@/actions'

interface AIGeneratorProps {
  deckId: string
}

export default function AIGenerator({ deckId }: AIGeneratorProps) {
  const [source, setSource] = useState('')
  const [sourceType, setSourceType] = useState<'text' | 'url'>('text')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<{ front: string; back: string }[]>([])
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!source.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: source.trim(), sourceType }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '生成失败')
      }

      const data = await res.json()
      setGenerated(data.cards)
    } catch (err: any) {
      setError(err.message || '生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAll() {
    setLoading(true)
    for (const card of generated) {
      await createCard({ front: card.front, back: card.back, deckId })
    }
    setGenerated([])
    setSource('')
    setLoading(false)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">🤖 AI 生成卡片</h2>
      <p className="text-sm text-slate-400 mb-4">
        粘贴学习材料或文章链接，AI 自动提取知识点并生成 Flashcards
      </p>

      {/* Source type toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSourceType('text')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            sourceType === 'text'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          粘贴文本
        </button>
        <button
          onClick={() => setSourceType('url')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            sourceType === 'url'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          文章链接
        </button>
      </div>

      {/* Input */}
      {sourceType === 'text' ? (
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="粘贴笔记、教材段落或任何学习材料..."
          rows={5}
        />
      ) : (
        <input
          type="url"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com/article"
        />
      )}

      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !source.trim()}
        className="mt-3 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition"
      >
        {loading ? 'AI 生成中...' : '🤖 AI 生成卡片'}
      </button>

      {/* Generated cards preview */}
      {generated.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400">已生成 {generated.length} 张卡片</p>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 rounded-lg text-white text-xs font-medium transition"
            >
              全部保存
            </button>
          </div>
          {generated.map((card, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/5">
              <p className="text-xs text-slate-500 mb-1">正面</p>
              <p className="text-sm text-white">{card.front}</p>
              <div className="border-t border-white/5 my-2" />
              <p className="text-xs text-slate-500 mb-1">背面</p>
              <p className="text-sm text-slate-300">{card.back}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
