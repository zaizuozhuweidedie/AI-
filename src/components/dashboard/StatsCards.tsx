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
    { label: '总卡片数', value: stats.totalCards },
    { label: '待复习', value: stats.dueCards },
    { label: '今日复习', value: stats.studiedToday },
    { label: '已掌握', value: stats.masteredCards },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="border border-gray-200 rounded-xl p-4"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
