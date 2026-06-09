'use client'

// Bar chart đơn giản — 14 cột, cao tỉ lệ với count
// Không cần thư viện ngoài
export default function ActivityChart({ days }) {
  const max = Math.max(...days.map(d => d.count), 1)

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })
  }

  const total = days.reduce((s, d) => s + d.count, 0)
  const avg   = (total / 14).toFixed(1)

  return (
    <div>
      {/* Bars */}
      <div className="flex items-end gap-1.5 h-32">
        {days.map(({ date, count }) => {
          const heightPct = (count / max) * 100
          const isToday   = date === new Date().toISOString().slice(0, 10)
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Tooltip on hover */}
              <div className="relative flex flex-col items-center">
                {count > 0 && (
                  <span className="absolute -top-5 text-[11px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {count}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    count === 0
                      ? 'bg-gray-100'
                      : isToday
                        ? 'bg-[#E24B4A]'
                        : 'bg-[#F4A3A2] group-hover:bg-[#E24B4A]'
                  }`}
                  style={{ height: `${Math.max(heightPct * 1.1, count > 0 ? 4 : 2)}px` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis labels — chỉ hiện đầu + giữa + cuối */}
      <div className="flex items-end gap-1.5 mt-1">
        {days.map(({ date }, i) => (
          <div key={date} className="flex-1 text-center">
            {(i === 0 || i === 6 || i === 13) && (
              <span className="text-[11px] text-gray-400">{formatDate(date)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-[12px] text-gray-400">Tổng 14 ngày</p>
          <p className="text-[15px] font-medium text-gray-800">{total}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400">Trung bình / ngày</p>
          <p className="text-[15px] font-medium text-gray-800">{avg}</p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400">Cao nhất</p>
          <p className="text-[15px] font-medium text-gray-800">{max}</p>
        </div>
      </div>
    </div>
  )
}
