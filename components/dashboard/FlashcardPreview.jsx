'use client'

// FlashcardPreview — nhận 1 entry thật từ Dashboard (Server Component)
// Flip interaction giữ ở client
import { useState } from 'react'
import Link from 'next/link'

export default function FlashcardPreview({ entry, reviewedToday, dailyGoal = 20 }) {
  const [flipped, setFlipped] = useState(false)

  const progress = Math.min((reviewedToday / dailyGoal) * 100, 100)

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-gray-800">🃏 Ôn tập nhanh</p>
        <Link href="/flashcard" className="text-[12px] text-gray-400 hover:text-gray-600">
          Bắt đầu session →
        </Link>
      </div>

      {entry ? (
        <>
          {/* Card flip */}
          <div
            onClick={() => setFlipped(v => !v)}
            className="flex-1 flex flex-col items-center justify-center gap-2
                       rounded-xl border border-gray-100 bg-gray-50 py-8 cursor-pointer
                       hover:bg-gray-100 transition-colors select-none min-h-[140px]"
          >
            {!flipped ? (
              <>
                <p className="text-[11px] text-gray-400">Nhấn để xem nghĩa</p>
                <p className="hanzi text-4xl">{entry.hanzi}</p>
                {entry.pinyin && (
                  <p className="text-[14px] text-gray-400">{entry.pinyin}</p>
                )}
              </>
            ) : (
              <>
                <p className="hanzi text-4xl">{entry.hanzi}</p>
                {entry.pinyin    && <p className="text-[15px] text-gray-500">{entry.pinyin}</p>}
                {entry.hv        && <p className="text-[13px] text-gray-400">{entry.hv}</p>}
                <p className="text-[16px] font-medium text-gray-800">{entry.meaning_vi}</p>
              </>
            )}
          </div>

          {/* Rating — chỉ hiện sau flip (không lưu vào review_log, chỉ là preview) */}
          {flipped && (
            <div className="flex gap-2 mt-3">
              {[
                { label: 'Khó', color: 'border-orange-200 text-orange-600 hover:bg-orange-50' },
                { label: 'Ổn',  color: 'border-green-200  text-green-600  hover:bg-green-50' },
                { label: 'Dễ',  color: 'border-blue-200   text-blue-600   hover:bg-blue-50' },
              ].map(({ label, color }) => (
                <button
                  key={label}
                  onClick={() => setFlipped(false)}
                  className={`flex-1 py-1.5 text-[12px] rounded-lg border transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Chưa có từ nào */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-3xl">📭</p>
          <p className="text-[13px] text-gray-400">Chưa có từ nào trong thư viện.</p>
          <Link href="/vocab/new" className="btn btn-primary text-[12px]">+ Thêm từ đầu tiên</Link>
        </div>
      )}

      {/* Progress hôm nay */}
      <div className="mt-3">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E24B4A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1 text-right">
          {reviewedToday} / {dailyGoal} ôn hôm nay
          {reviewedToday >= dailyGoal && ' 🎉'}
        </p>
      </div>
    </div>
  )
}
