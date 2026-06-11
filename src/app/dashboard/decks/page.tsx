import Link from 'next/link'
import { getDecks } from '@/actions'

export default async function DecksPage() {
  const decks = await getDecks()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">我的卡组</h1>
          <p className="text-slate-400 mt-1">管理你的学习卡组</p>
        </div>
        <Link
          href="/dashboard/decks/new"
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white font-medium transition text-sm"
        >
          + 新建卡组
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-white mb-2">还没有卡组</h2>
          <p className="text-slate-400 mb-6">创建第一个卡组，开始你的学习之旅吧</p>
          <Link
            href="/dashboard/decks/new"
            className="inline-block px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white font-medium transition"
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
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: deck.color || '#6366f1' }}
                >
                  {deck.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="font-semibold text-white group-hover:text-indigo-300 transition">
                {deck.name}
              </h3>
              {deck.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{deck.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span>{deck._count.cards} 张卡片</span>
                {deck.dueCards !== undefined && deck.dueCards > 0 && (
                  <span className="text-orange-400">{deck.dueCards} 张待复习</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
