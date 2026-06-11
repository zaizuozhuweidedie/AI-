import Link from 'next/link'

interface StatsCardsProps {
  stats: {
    totalCards: number
    dueCards: number
    studiedToday: number
    masteredCards: number
    totalStudyTime: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: '总卡片数', value: stats.totalCards, color: 'from-indigo-500/20 to-indigo-600/10', textColor: 'text-indigo-300' },
    { label: '待复习', value: stats.dueCards, color: 'from-orange-500/20 to-orange-600/10', textColor: 'text-orange-300' },
    { label: '今日复习', value: stats.studiedToday, color: 'from-green-500/20 to-green-600/10', textColor: 'text-green-300' },
    { label: '已掌握', value: stats.masteredCards, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-300' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} border border-white/10 rounded-xl p-4`}
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
