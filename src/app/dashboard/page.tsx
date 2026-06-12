import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudyStats, getDueCards } from '@/actions'
import StudyHeatmap from '@/components/dashboard/StudyHeatmap'
import StatsCards from '@/components/dashboard/StatsCards'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const stats = await getStudyStats(session.user.id)
  const dueCards = await getDueCards()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来{session.user.name ? `, ${session.user.name}` : ''}</p>
      </div>

      <StatsCards stats={stats} />

      <div className="border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">待复习卡片</h2>
          {dueCards.length > 0 && (
            <Link
              href="/dashboard/study"
              className="text-sm px-4 py-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white font-medium transition"
            >
              开始复习 ({dueCards.length})
            </Link>
          )}
        </div>

        {dueCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-gray-500">太棒了！所有卡片都已复习完毕</p>
            <Link
              href="/dashboard/decks/new"
              className="inline-block mt-4 text-sm text-gray-700 hover:text-gray-900"
            >
              创建新卡组 →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {dueCards.slice(0, 5).map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{card.front}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.deck.name}</p>
                </div>
                <span className="text-xs text-gray-400 ml-4">
                  {card.easeFactor.toFixed(1)}x
                </span>
              </div>
            ))}
            {dueCards.length > 5 && (
              <p className="text-xs text-gray-400 text-center pt-2">
                还有 {dueCards.length - 5} 张待复习卡片
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">学习热力图</h2>
        <StudyHeatmap data={stats.dailyActivity} />
      </div>
    </div>
  )
}
