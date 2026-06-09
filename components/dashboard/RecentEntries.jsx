import Link from 'next/link'

// Props: entries — array từ Supabase query
export default function RecentEntries({ entries }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-gray-800">🕐 Mới thêm gần đây</p>
        <Link href="/vocab" className="text-[12px] text-gray-400 hover:text-gray-600">
          Xem thư viện →
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-4 text-center">
          Chưa có từ nào — <Link href="/vocab/new" className="text-[#E24B4A]">thêm từ đầu tiên</Link>
        </p>
      ) : (
        <div className="divide-y divide-gray-50">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="hanzi text-[20px]">{entry.hanzi}</p>
                {entry.pinyin && (
                  <p className="text-[13px] text-gray-400 mt-0.5">{entry.pinyin}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${entry.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'}`}>
                  {entry.type === 'vocab' ? 'từ vựng' : 'cấu trúc'}
                </span>
                <p className="text-[14px] text-gray-500 max-w-[160px] text-right truncate">
                  {entry.meaning_vi}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
