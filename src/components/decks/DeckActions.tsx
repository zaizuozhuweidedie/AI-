'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDeck } from '@/actions'

export default function DeckActions({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteDeck(deckId)
    router.push('/dashboard/decks')
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-sm transition"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-sm text-slate-400 mb-6">删除后卡组和所有卡片将不可恢复，确定要删除吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg text-white text-sm transition"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
