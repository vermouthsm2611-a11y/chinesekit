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

// Interval (ngày) theo bucket: index = bucket number
const BUCKET_INTERVALS = [0, 1, 3, 7]

// Màu badge bucket
const BUCKET_STYLES = {
  0: { label: 'Mới',  bg: 'bg-blue-50',   text: 'text-blue-600'  },
  1: { label: 'B1',   bg: 'bg-red-50',    text: 'text-red-500'   },
  2: { label: 'B2',   bg: 'bg-yellow-50', text: 'text-yellow-600'},
  3: { label: 'B3',   bg: 'bg-green-50',  text: 'text-green-600' },
}

/**
 * Tính bucket mới và ngày ôn tiếp theo dựa trên kết quả rating.
 * @param {number} currentBucket - Bucket hiện tại (0 = chưa học)
 * @param {'correct'|'incorrect'|'skip'} result
 * @param {string} today - 'YYYY-MM-DD'
 * @returns {{ newBucket: number, nextReview: string }}
 */
function calcProgress(currentBucket, result, today) {
  let newBucket

  if (result === 'correct') {
    newBucket = Math.min((currentBucket || 1) + 1, 3)  // bucket 0 → treat as 1 khi đúng
  } else if (result === 'incorrect') {
    newBucket = 1  // reset về đầu
  } else {
    // skip: giữ bucket (hoặc set 1 nếu chưa học), ôn lại ngày mai
    newBucket = currentBucket || 1
  }

  // Tính next_review
  const d = new Date(today)
  d.setDate(d.getDate() + BUCKET_INTERVALS[newBucket])
  const nextReview = d.toISOString().split('T')[0]

  return { newBucket, nextReview }
}

const RATINGS = [
  { value: 'incorrect', label: 'Khó',    color: 'border-orange-200 text-orange-600 hover:bg-orange-50' },
  { value: 'correct',   label: 'Ổn',     color: 'border-green-200  text-green-700  hover:bg-green-50'  },
  { value: 'skip',      label: 'Bỏ qua', color: 'border-gray-200   text-gray-500   hover:bg-gray-50'   },
]

// ── Main component ───────────────────────────────────────────────────────────
/**
 * Props:
 *   entries     — array từ server (đã filter + sort theo Leitner)
 *   progressMap — { [entry_id]: { bucket, next_review } } — bucket hiện tại của từng entry
 *   today       — 'YYYY-MM-DD' từ server (tránh timezone lệch giữa server/client)
 */
export default function FlashcardSession({ entries, progressMap = {}, today }) {
  // Shuffle sau mount — tránh hydration mismatch với Math.random()
  const [deck,    setDeck]    = useState(entries)
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  // results: [{ entry_id, result, newBucket, nextReview }]
  const [results, setResults] = useState([])
  const [done,    setDone]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    setDeck(shuffle(entries))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const current  = deck[index]
  const total    = deck.length
  const progress = Math.round((index / total) * 100)

  // Bucket hiện tại của card đang hiển thị (0 = chưa học bao giờ)
  const currentBucket = progressMap[current?.id]?.bucket ?? 0

  const rate = useCallback(async (result) => {
    const { newBucket, nextReview } = calcProgress(currentBucket, result, today)

    const newResults = [
      ...results,
      { entry_id: current.id, result, newBucket, nextReview },
    ]
    setResults(newResults)

    if (index + 1 >= total) {
      // ── Session kết thúc — lưu vào DB ──────────────────────────────────
      setSaving(true)

      await Promise.all([
        // 1. review_log — giữ nguyên cho Stats page
        supabase.from('review_log').insert(
          newResults.map(r => ({ entry_id: r.entry_id, result: r.result }))
        ),
        // 2. entry_progress — upsert bucket mới
        supabase.from('entry_progress').upsert(
          newResults.map(r => ({
            entry_id:    r.entry_id,
            bucket:      r.newBucket,
            next_review: r.nextReview,
          })),
          { onConflict: 'entry_id' }
        ),
      ])

      setSaving(false)
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }, [current, currentBucket, index, results, today, total])

  const restart = () => {
    setDeck(shuffle(entries))
    setIndex(0)
    setFlipped(false)
    setResults([])
    setDone(false)
  }

  // ── Màn hình kết quả ──────────────────────────────────────────────────────
  if (done) {
    const correct   = results.filter(r => r.result === 'correct').length
    const incorrect = results.filter(r => r.result === 'incorrect').length
    const skipped   = results.filter(r => r.result === 'skip').length

    // Thống kê bucket movement
    const promoted  = results.filter(r => r.result === 'correct').length   // lên bucket
    const demoted   = results.filter(r => r.result === 'incorrect').length // về B1

    return (
      <div className="card max-w-md mx-auto text-center py-10">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-lg font-medium mb-1">Session hoàn thành!</h2>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>{total} từ đã ôn</p>

        {/* Kết quả rating */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Bucket movement summary */}
        <div className="rounded-xl p-3 mb-6 text-[13px] text-left space-y-1"
             style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
          {promoted  > 0 && <p>⬆️ {promoted} từ lên bucket cao hơn</p>}
          {demoted   > 0 && <p>⬇️ {demoted} từ reset về B1</p>}
          {skipped   > 0 && <p>⏭️ {skipped} từ bỏ qua, ôn lại ngày mai</p>}
        </div>

        <button onClick={restart} className="btn btn-primary w-full justify-center">
          🔄 Ôn lại
        </button>
      </div>
    )
  }

  // ── Session đang chạy ─────────────────────────────────────────────────────
  const bucketStyle = BUCKET_STYLES[currentBucket] ?? BUCKET_STYLES[1]

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm mb-2"
           style={{ color: 'var(--text-muted)' }}>
        <span>{index + 1} / {total}</span>
        <span>{progress}%</span>
      </div>
      <div className="progress-bar mb-5">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`card min-h-[340px] flex flex-col items-center justify-center gap-4
                    text-center transition-all duration-200 select-none
                    ${!flipped ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        {!flipped ? (
          <>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nhấn để xem nghĩa</p>
            <p className="hanzi text-6xl leading-tight">{current.hanzi}</p>

            {/* Badge type + bucket */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${current.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'}`}>
                {current.type === 'vocab' ? 'từ vựng' : 'cấu trúc'}
              </span>
              {/* Bucket badge — feedback trực quan cho user */}
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${bucketStyle.bg} ${bucketStyle.text}`}>
                {bucketStyle.label}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="hanzi text-5xl">{current.hanzi}</p>
            {current.pinyin && (
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                <PinyinText pinyin={current.pinyin} />
                {current.hv && (
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>· {current.hv}</span>
                )}
              </p>
            )}
            <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              {current.meaning_vi}
            </p>
            {current.meaning_en && (
              <p className="text-base italic" style={{ color: 'var(--text-muted)' }}>
                {current.meaning_en}
              </p>
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
