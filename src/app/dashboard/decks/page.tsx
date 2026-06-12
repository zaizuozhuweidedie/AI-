import Link from 'next/link'
import { getDecks } from '@/actions'

export default async function DecksPage() {
  const decks = await getDecks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的卡组</h1>
          <p className="text-gray-500 mt-1">管理你的学习卡组</p>
        </div>
        <Link
          href="/dashboard/decks/new"
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition text-sm"
        >
          + 新建卡组
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">还没有卡组</h2>
          <p className="text-gray-500 mb-6">创建第一个卡组，开始你的学习之旅吧</p>
          <Link
            href="/dashboard/decks/new"
            className="inline-block px-6 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition"
          >
            创建卡组
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/dashboard/decks/${deck.id}`}
              className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3"
                style={{ backgroundColor: deck.color || '#6366f1' }}
              >
                {deck.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition">
                {deck.name}
              </h3>
              {deck.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{deck.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span>{deck._count.cards} 张卡片</span>
                {deck.dueCards !== undefined && deck.dueCards > 0 && (
                  <span className="text-gray-700 font-medium">{deck.dueCards} 张待复习</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
