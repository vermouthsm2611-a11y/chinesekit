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
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          🃏 Ôn tập nhanh
        </p>
        <Link
          href="/flashcard"
          className="text-[13px] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          Bắt đầu session →
        </Link>
      </div>

      {entry ? (
        <>
          {/* Card flip */}
          <div
            onClick={() => setFlipped(v => !v)}
            className="flex-1 flex flex-col items-center justify-center gap-2
                       rounded-xl py-8 cursor-pointer select-none min-h-[140px]
                       transition-colors"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-muted)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--violet-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
          >
            {!flipped ? (
              <>
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Nhấn để xem nghĩa
                </p>
                <p className="hanzi text-4xl" style={{ color: 'var(--text-primary)' }}>
                  {entry.hanzi}
                </p>
                {entry.pinyin && (
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    {entry.pinyin}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="hanzi text-4xl" style={{ color: 'var(--text-primary)' }}>
                  {entry.hanzi}
                </p>
                {entry.pinyin && (
                  <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                    {entry.pinyin}
                  </p>
                )}
                {entry.hv && (
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    {entry.hv}
                  </p>
                )}
                <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {entry.meaning_vi}
                </p>
              </>
            )}
          </div>

          {/* Rating buttons — chỉ hiện sau flip (preview only, không lưu review_log) */}
          {flipped && (
            <div className="flex gap-2 mt-3">
              {[
                { label: 'Khó',   bg: 'var(--warning-soft)',  color: 'var(--warning)' },
                { label: 'Ổn',    bg: 'var(--success-soft)',  color: 'var(--success)' },
                { label: 'Dễ',    bg: 'var(--violet-soft)',   color: 'var(--violet)' },
              ].map(({ label, bg, color }) => (
                <button
                  key={label}
                  onClick={() => setFlipped(false)}
                  className="flex-1 py-2 text-[13px] font-medium rounded-xl border transition-colors"
                  style={{ borderColor: bg, background: 'transparent', color }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Chưa có từ nào trong thư viện.
          </p>
          <Link href="/vocab/new" className="btn btn-primary text-[13px]">
            + Thêm từ đầu tiên
          </Link>
        </div>
      )}

      {/* Progress bar hôm nay — dùng gradient pink→violet */}
      <div className="mt-3">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[13px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {reviewedToday} / {dailyGoal} ôn hôm nay
          {reviewedToday >= dailyGoal && ' 🎉'}
        </p>
      </div>
    </div>
  )
}
