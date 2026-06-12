'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDeck } from '@/actions'

const COLORS = ['#374151', '#6366f1', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d']

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
        <h1 className="text-3xl font-bold text-gray-900">新建卡组</h1>
        <p className="text-gray-500 mt-1">创建一个新的学习卡组</p>
      </div>

      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">卡组名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="例如：React 面试题"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">描述（选填）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            placeholder="这个卡组用来学什么的？"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">颜色</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg transition ${color === c ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm transition"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg text-white font-medium transition text-sm"
          >
            {loading ? '创建中...' : '创建卡组'}
          </button>
        </div>
      </form>
    </div>
  )
}
