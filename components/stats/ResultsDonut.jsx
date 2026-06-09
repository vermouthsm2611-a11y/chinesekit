'use client'

// Kết quả ôn tập: correct / incorrect / skip
// Hiển thị dạng stacked bar + legend
const COLORS = {
  correct:   { bg: 'bg-green-400',  text: 'text-green-700',  label: '✓ Đúng'  },
  incorrect: { bg: 'bg-orange-400', text: 'text-orange-700', label: '✗ Sai'   },
  skip:      { bg: 'bg-gray-300',   text: 'text-gray-600',   label: '— Bỏ qua' },
}

export default function ResultsDonut({ results, total }) {
  const items = Object.entries(results).map(([key, count]) => ({
    key,
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
    ...COLORS[key],
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Stacked bar */}
      <div className="flex h-6 rounded-lg overflow-hidden gap-0.5">
        {items.map(({ key, pct, bg }) =>
          pct > 0 ? (
            <div
              key={key}
              className={`${bg} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${key}: ${pct}%`}
            />
          ) : null
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {items.map(({ key, count, pct, bg, text, label }) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${bg}`} />
            <span className="text-[13px] text-gray-600 flex-1">{label}</span>
            <span className={`text-[13px] font-medium ${text}`}>{count}</span>
            <span className="text-[13px] text-gray-400 w-8 text-right">{pct}%</span>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
          <div className="w-2.5" />
          <span className="text-[13px] text-gray-400 flex-1">Tổng</span>
          <span className="text-[13px] font-medium text-gray-700">{total}</span>
        </div>
      </div>
    </div>
  )
}
