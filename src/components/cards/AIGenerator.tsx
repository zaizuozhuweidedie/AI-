'use client'

import { useState } from 'react'
import { createCard } from '@/actions'

interface CardPreview {
  type: string
  front: string
  back: string
}

interface AIGeneratorProps {
  deckId: string
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  qa: { label: '问答', icon: '📝', color: 'border-l-indigo-500' },
  judge: { label: '判断', icon: '✅', color: 'border-l-amber-500' },
  blank: { label: '填空', icon: '✏️', color: 'border-l-emerald-500' },
}

export default function AIGenerator({ deckId }: AIGeneratorProps) {
  const [source, setSource] = useState('')
  const [sourceType, setSourceType] = useState<'text' | 'url'>('text')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<CardPreview[]>([])
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredCards = filterType === 'all'
    ? generated
    : generated.filter((c) => c.type === filterType)

  const typeCounts = generated.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
      setGenerated(data.cards || [])
    } catch (err: any) {
      setError(err.message || '生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAll() {
    setLoading(true)
    for (const card of generated) {
      const label = TYPE_LABELS[card.type]?.label || ''
      await createCard({
        front: card.type === 'judge'
          ? `[判断] ${card.front}`
          : card.type === 'blank'
          ? `[填空] ${card.front}`
          : card.front,
        back: card.type === 'judge' || card.type === 'blank'
          ? `${card.type === 'judge' ? '判断结果' : '答案'}：${card.back}`
          : card.back,
        deckId,
      })
    }
    setGenerated([])
    setSource('')
    setLoading(false)
  }

  function renderCardPreview(card: CardPreview) {
    const info = TYPE_LABELS[card.type] || TYPE_LABELS['qa']

    return (
      <div
        key={`${card.type}-${card.front.slice(0, 20)}`}
        className={`bg-white/5 rounded-lg p-4 border border-white/5 border-l-4 ${info.color}`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">{info.icon}</span>
          <span className="text-[10px] text-slate-500 uppercase">{info.label}</span>
        </div>

        {card.type === 'judge' ? (
          <>
            <p className="text-sm text-white">{card.front}</p>
            <div className="border-t border-white/5 my-2" />
            <div className="flex items-center gap-2">
              {card.back.startsWith('正确') || card.back.startsWith('对') ? (
                <span className="text-lg">✅</span>
              ) : (
                <span className="text-lg">❌</span>
              )}
              <p className="text-sm text-slate-300">{card.back}</p>
            </div>
          </>
        ) : card.type === 'blank' ? (
          <>
            <p className="text-sm text-white leading-relaxed">
              {card.front.split('____').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-4 mx-1 border-b-2 border-dashed border-emerald-400 text-emerald-400">
                      ?
                    </span>
                  )}
                </span>
              ))}
            </p>
            <div className="border-t border-white/5 my-2" />
            <p className="text-xs text-slate-500 mb-1">答案</p>
            <p className="text-sm text-emerald-300">{card.back}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-1">正面</p>
            <p className="text-sm text-white">{card.front}</p>
            <div className="border-t border-white/5 my-2" />
            <p className="text-xs text-slate-500 mb-1">反面</p>
            <p className="text-sm text-slate-300">{card.back}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">🤖 AI 生成卡片</h2>
      <p className="text-sm text-slate-400 mb-4">
        粘贴学习材料或文章链接，AI 自动提取知识点并生成问答、判断、填空三类卡片
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

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={loading || !source.trim()}
        className="mt-3 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition"
      >
        {loading ? 'AI 生成中...' : '🤖 AI 生成卡片'}
      </button>

      {/* Filter tabs */}
      {generated.length > 0 && (
        <div className="flex gap-2 mt-6 mb-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterType === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            全部 ({generated.length})
          </button>
          {Object.entries(TYPE_LABELS).map(([key, info]) => (
            typeCounts[key] > 0 && (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterType === key
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                {info.icon} {info.label} ({typeCounts[key]})
              </button>
            )
          ))}
        </div>
      )}

      {/* Generated cards preview */}
      {generated.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-400">已生成 {generated.length} 张卡片</p>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 rounded-lg text-white text-xs font-medium transition"
            >
              全部保存到卡组
            </button>
          </div>
          {filteredCards.map(renderCardPreview)}
        </div>
      )}
    </div>
  )
}
