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
  qa: { label: '问答', icon: '📝', color: 'border-l-gray-900' },
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '生成失败') }
      const data = await res.json()
      setGenerated(data.cards || [])
    } catch (err: any) {
      setError(err.message || '生成失败，请稍后重试')
    } finally { setLoading(false) }
  }

  async function handleSaveAll() {
    setLoading(true)
    for (const card of generated) {
      await createCard({
        front: card.type === 'judge' ? `[判断] ${card.front}` : card.type === 'blank' ? `[填空] ${card.front}` : card.front,
        back: card.type === 'judge' || card.type === 'blank' ? `${card.type === 'judge' ? '判断结果' : '答案'}：${card.back}` : card.back,
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
      <div key={`${card.type}-${card.front.slice(0, 20)}`} className={`bg-gray-50 rounded-lg p-4 border border-gray-200 border-l-4 ${info.color}`}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">{info.icon}</span>
          <span className="text-[10px] text-gray-500 uppercase">{info.label}</span>
        </div>
        {card.type === 'judge' ? (
          <>
            <p className="text-sm text-gray-900">{card.front}</p>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex items-center gap-2">
              {card.back.startsWith('正确') || card.back.startsWith('对') ? <span className="text-lg">✅</span> : <span className="text-lg">❌</span>}
              <p className="text-sm text-gray-600">{card.back}</p>
            </div>
          </>
        ) : card.type === 'blank' ? (
          <>
            <p className="text-sm text-gray-900 leading-relaxed">
              {card.front.split('____').map((part, i, arr) => (
                <span key={i}>{part}{i < arr.length - 1 && <span className="inline-block px-4 mx-1 border-b-2 border-dashed border-emerald-500 text-emerald-600">?</span>}</span>
              ))}
            </p>
            <div className="border-t border-gray-200 my-2" />
            <p className="text-xs text-gray-400 mb-1">答案</p>
            <p className="text-sm text-emerald-700">{card.back}</p>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-1">正面</p>
            <p className="text-sm text-gray-900">{card.front}</p>
            <div className="border-t border-gray-200 my-2" />
            <p className="text-xs text-gray-400 mb-1">反面</p>
            <p className="text-sm text-gray-600">{card.back}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI 生成卡片</h2>
      <p className="text-sm text-gray-500 mb-4">粘贴学习材料或文章链接，AI 自动提取知识点并生成问答、判断、填空三类卡片</p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setSourceType('text')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${sourceType === 'text' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>粘贴文本</button>
        <button onClick={() => setSourceType('url')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${sourceType === 'url' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>文章链接</button>
      </div>

      {sourceType === 'text' ? (
        <textarea value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" placeholder="粘贴笔记、教材段落或任何学习材料..." rows={5} />
      ) : (
        <input type="url" value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="https://example.com/article" />
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <button onClick={handleGenerate} disabled={loading || !source.trim()} className="mt-3 px-5 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition">{loading ? 'AI 生成中...' : '🤖 AI 生成卡片'}</button>

      {generated.length > 0 && (
        <div className="flex gap-2 mt-6 mb-3">
          <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${filterType === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}>全部 ({generated.length})</button>
          {Object.entries(TYPE_LABELS).map(([key, info]) => typeCounts[key] > 0 && (
            <button key={key} onClick={() => setFilterType(key)} className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${filterType === key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'}`}>{info.icon} {info.label} ({typeCounts[key]})</button>
          ))}
        </div>
      )}

      {generated.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700">已生成 {generated.length} 张卡片</p>
            <button onClick={handleSaveAll} disabled={loading} className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg text-white text-xs font-medium transition">全部保存到卡组</button>
          </div>
          {filteredCards.map(renderCardPreview)}
        </div>
      )}
    </div>
  )
}
