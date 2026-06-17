'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PinyinText from '@/components/ui/PinyinText'

// ── Helpers ──────────────────────────────────────────────────────────────────

// Fisher-Yates shuffle — tránh bias của sort(() => Math.random() - 0.5)
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const RATINGS = [
  { value: 'incorrect', label: 'Khó',  color: 'border-orange-200 text-orange-600 hover:bg-orange-50' },
  { value: 'correct',   label: 'Ổn',   color: 'border-green-200  text-green-700  hover:bg-green-50'  },
  { value: 'skip',      label: 'Bỏ qua', color: 'border-gray-200 text-gray-500 hover:bg-gray-50'    },
]

// ── Main component ───────────────────────────────────────────────────────────
// Props: entries — array từ server (đã fetch)
export default function FlashcardSession({ entries }) {
  // Không shuffle trong useState — SSR vs client Math.random() khác nhau → hydration error
  // Shuffle sau khi mount bằng useEffect
  const [deck,    setDeck]    = useState(entries)
  const [index,   setIndex]   = useState(0)

  // Shuffle sau khi hydration xong
  useEffect(() => {
    setDeck(shuffle(entries))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])   // { entry_id, result }
  const [done,    setDone]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  const current  = deck[index]
  const total    = deck.length
  const progress = Math.round((index / total) * 100)

  // Ghi rating → advance card
  const rate = useCallback(async (result) => {
    const newResults = [...results, { entry_id: current.id, result }]
    setResults(newResults)

    if (index + 1 >= total) {
      // Session kết thúc — lưu toàn bộ vào review_log một lần
      setSaving(true)
      await supabase.from('review_log').insert(
        newResults.map(r => ({ entry_id: r.entry_id, result: r.result }))
      )
      setSaving(false)
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }, [current, index, results, total])

  // Restart session với deck mới shuffle
  const restart = () => {
    setDeck(shuffle(entries))
    setIndex(0)
    setFlipped(false)
    setResults([])
    setDone(false)
  }

  // ── Màn hình kết quả ────────────────────────────────────────────────────
  if (done) {
    const correct   = results.filter(r => r.result === 'correct').length
    const incorrect = results.filter(r => r.result === 'incorrect').length
    const skipped   = results.filter(r => r.result === 'skip').length

    return (
      <div className="card max-w-md mx-auto text-center py-10">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-lg font-medium mb-1">Session hoàn thành!</h2>
        <p className="text-[13px] text-gray-400 mb-6">{total} từ đã ôn</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-green-700">{correct}</p>
            <p className="text-[13px] text-green-600 mt-0.5">Ổn</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-orange-700">{incorrect}</p>
            <p className="text-[13px] text-orange-600 mt-0.5">Khó</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-2xl font-medium text-gray-600">{skipped}</p>
            <p className="text-[13px] text-gray-500 mt-0.5">Bỏ qua</p>
          </div>
        </div>

        <button onClick={restart} className="btn btn-primary w-full justify-center">
          🔄 Ôn lại
        </button>
      </div>
    )
  }

  // ── Session đang chạy ────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
        <span>{index + 1} / {total}</span>
        <span>{progress}%</span>
      </div>
      <div className="progress-bar mb-5">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card — min-h tăng để card có trọng lượng hơn trên màn rộng */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`card min-h-[340px] flex flex-col items-center justify-center gap-4
                    text-center transition-all duration-200 select-none
                    ${!flipped ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        {!flipped ? (
          // Mặt trước — chỉ hiện hanzi
          <>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa</p>
            <p className="hanzi text-6xl leading-tight">{current.hanzi}</p>
            <span className={`badge mt-1 ${current.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'}`}>
              {current.type === 'vocab' ? 'từ vựng' : 'cấu trúc'}
            </span>
          </>
        ) : (
          // Mặt sau — đầy đủ thông tin
          <>
            <p className="hanzi text-5xl">{current.hanzi}</p>
            {current.pinyin && (
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                <PinyinText pinyin={current.pinyin} />
                {current.hv && <span className="ml-2" style={{ color: 'var(--text-muted)' }}>· {current.hv}</span>}
              </p>
            )}
            <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              {current.meaning_vi}
            </p>
            {current.meaning_en && (
              <p className="text-base italic" style={{ color: 'var(--text-muted)' }}>{current.meaning_en}</p>
            )}
            {current.example && (
              <div className="w-full mt-2 p-4 rounded-xl text-left"
                   style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)' }}>
                <p className="text-base" style={{ color: 'var(--text-primary)' }}>{current.example}</p>
                {current.example_vi && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{current.example_vi}</p>
                )}
              </div>
            )}
            {current.notes && (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>{current.notes}</p>
            )}
          </>
        )}
      </div>

      {/* Rating buttons — chỉ hiện sau khi flip */}
      <div className={`flex gap-3 mt-4 transition-opacity ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {RATINGS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => rate(value)}
            disabled={saving}
            className={`flex-1 py-3 text-sm rounded-xl border font-medium
                        transition-colors disabled:opacity-50 ${color}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Skip khi chưa flip */}
      {!flipped && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => rate('skip')}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Bỏ qua →
          </button>
        </div>
      )}
    </div>
  )
}
