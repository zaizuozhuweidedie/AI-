'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeck } from '@/actions'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4']

export default function NewDeckPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const deck = await createDeck({ name: name.trim(), description: description.trim() || undefined, color })
    router.push(`/dashboard/decks/${deck.id}`)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">新建卡组</h1>
        <p className="text-slate-400 mt-1">创建一个新的学习卡组</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">卡组名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="例如：React 面试题"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">描述（选填）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="这个卡组用来学什么的？"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-2">颜色</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg transition ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-lg text-white font-medium transition text-sm"
          >
            {loading ? '创建中...' : '创建卡组'}
          </button>
        </div>
      </form>
    </div>
  )
}
