'use client'

interface StudyHeatmapProps {
  data: { date: string; count: number }[]
}

export default function StudyHeatmap({ data }: StudyHeatmapProps) {
  const today = new Date()
  const days: { date: string; count: number; dayOfWeek: number }[] = []

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = data.find((item) => item.date === dateStr)
    days.push({ date: dateStr, count: found?.count || 0, dayOfWeek: d.getDay() })
  }

  const weeks: typeof days[] = []
  let currentWeek: typeof days = []
  days.forEach((day) => {
    currentWeek.push(day)
    if (day.dayOfWeek === 6) { weeks.push(currentWeek); currentWeek = [] }
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-200'
    if (count <= 3) return 'bg-gray-300'
    if (count <= 10) return 'bg-gray-500'
    if (count <= 20) return 'bg-gray-700'
    return 'bg-gray-900'
  }

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-4 h-3 text-[10px] text-gray-400 flex items-center justify-end leading-none">
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div key={day.date} className={`w-3 h-3 rounded-sm ${getColor(day.count)}`} title={`${day.date}: ${day.count} 次复习`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end text-xs text-gray-400">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-gray-200" />
        <div className="w-3 h-3 rounded-sm bg-gray-300" />
        <div className="w-3 h-3 rounded-sm bg-gray-500" />
        <div className="w-3 h-3 rounded-sm bg-gray-700" />
        <div className="w-3 h-3 rounded-sm bg-gray-900" />
        <span>多</span>
      </div>
    </div>
  )
}
