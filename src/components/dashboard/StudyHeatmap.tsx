'use client'

interface StudyHeatmapProps {
  data: { date: string; count: number }[]
}

export default function StudyHeatmap({ data }: StudyHeatmapProps) {
  // 构建最近 12 周（84 天）的热力图
  const today = new Date()
  const days: { date: string; count: number; dayOfWeek: number }[] = []

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = data.find((item) => item.date === dateStr)
    days.push({
      date: dateStr,
      count: found?.count || 0,
      dayOfWeek: d.getDay(),
    })
  }

  // 按周分组（每周从周日开始）
  const weeks: typeof days[] = []
  let currentWeek: typeof days = []
  days.forEach((day) => {
    currentWeek.push(day)
    if (day.dayOfWeek === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800'
    if (count <= 3) return 'bg-indigo-900'
    if (count <= 10) return 'bg-indigo-700'
    if (count <= 20) return 'bg-indigo-500'
    return 'bg-indigo-400'
  }

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-4 h-3 text-[10px] text-slate-500 flex items-center justify-end leading-none">
              {i % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                title={`${day.date}: ${day.count} 次复习`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end text-xs text-slate-500">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-slate-800" />
        <div className="w-3 h-3 rounded-sm bg-indigo-900" />
        <div className="w-3 h-3 rounded-sm bg-indigo-700" />
        <div className="w-3 h-3 rounded-sm bg-indigo-500" />
        <div className="w-3 h-3 rounded-sm bg-indigo-400" />
        <span>多</span>
      </div>
    </div>
  )
}
