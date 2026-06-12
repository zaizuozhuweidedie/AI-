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
        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-500 text-sm transition"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-6">删除后卡组和所有卡片将不可恢复，确定要删除吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 text-sm transition"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white text-sm transition"
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
