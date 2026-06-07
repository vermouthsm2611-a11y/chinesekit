'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const SOURCE_LABELS = {
  manual: '✏️ Manual',
  douyin: '📱 Douyin',
  music:  '🎵 Nhạc',
  game:   '🎮 Game',
}

export default function PatternList({ patterns }) {
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return patterns
    return patterns.filter(p =>
      p.hanzi.includes(q) ||
      p.meaning_vi?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q) ||
      p.examples?.some(e => e.hanzi?.includes(q) || e.vi?.toLowerCase().includes(q))
    )
  }, [patterns, search])

  if (patterns.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-3xl mb-3">🧩</p>
        <p className="text-[14px] text-gray-400 mb-4">Chưa có cấu trúc nào.</p>
        <Link href="/vocab/new?type=pattern" className="btn btn-primary inline-flex">
          + Thêm cấu trúc đầu tiên
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Tìm cấu trúc, nghĩa, ví dụ..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-[13px] text-gray-400 mt-4">Không tìm thấy kết quả nào.</p>
      ) : (
        filtered.map(p => (
          <PatternCard
            key={p.id}
            pattern={p}
            isOpen={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
          />
        ))
      )}
    </div>
  )
}

// ── PatternCard ────────────────────────────────────────────────────────────────
function PatternCard({ pattern, isOpen, onToggle }) {
  // Normalize examples: ưu tiên jsonb mới, fallback data cũ
  const examples = pattern.examples?.length
    ? pattern.examples
    : pattern.example
      ? [{ hanzi: pattern.example, pinyin: '', vi: pattern.example_vi ?? '' }]
      : []

  const firstExample  = examples[0] ?? null
  const extraExamples = examples.slice(1)

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header — luôn hiện, click để expand/collapse */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          {/* Pattern */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="hanzi text-[18px]">{pattern.hanzi}</span>
            {pattern.pinyin && <span className="text-[13px] text-gray-400">{pattern.pinyin}</span>}
            {pattern.hv     && <span className="text-[12px] text-gray-400 italic">{pattern.hv}</span>}
          </div>
          {pattern.meaning_vi && (
            <p className="text-[13px] text-gray-600 mt-0.5">{pattern.meaning_vi}</p>
          )}

          {/* Ví dụ đầu tiên — luôn hiện */}
          {firstExample && (
            <div className="mt-3 pl-3 border-l-2 border-gray-100">
              <p className="hanzi text-[15px] text-gray-700">{firstExample.hanzi}</p>
              {firstExample.pinyin && (
                <p className="text-[12px] text-gray-400 mt-0.5">{firstExample.pinyin}</p>
              )}
              {firstExample.vi && (
                <p className="text-[12px] text-gray-500 italic mt-0.5">{firstExample.vi}</p>
              )}
            </div>
          )}
        </div>

        {/* Meta + toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {pattern.source && pattern.source !== 'manual' && (
            <span className="text-[11px] text-gray-400">{SOURCE_LABELS[pattern.source]}</span>
          )}
          {(extraExamples.length > 0 || pattern.notes) && (
            <span className="text-[10px] text-gray-300 border border-gray-200 rounded px-1">
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        </div>
      </button>

      {/* Expanded: ví dụ còn lại + ghi chú */}
      {isOpen && (extraExamples.length > 0 || pattern.notes) && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex flex-col gap-4">

          {extraExamples.map((ex, i) => (
            <div key={i} className="pl-3 border-l-2 border-gray-200">
              <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">
                Ví dụ {i + 2}
              </p>
              <p className="hanzi text-[15px] text-gray-700">{ex.hanzi}</p>
              {ex.pinyin && <p className="text-[12px] text-gray-400 mt-0.5">{ex.pinyin}</p>}
              {ex.vi     && <p className="text-[12px] text-gray-500 italic mt-0.5">{ex.vi}</p>}
            </div>
          ))}

          {pattern.notes && (
            <div>
              <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">Ghi chú</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">{pattern.notes}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Link href={`/vocab/${pattern.id}?back=/patterns`}
              className="text-[12px] text-gray-400 hover:text-[#E24B4A] transition-colors">
              ✏️ Sửa →
            </Link>
          </div>
        </div>
      )}

      {/* Nếu không có extra nhưng vẫn muốn link sửa → hiện inline */}
      {!isOpen && extraExamples.length === 0 && !pattern.notes && (
        <div className="px-5 pb-3 flex justify-end">
          <Link href={`/vocab/${pattern.id}?back=/patterns`}
            className="text-[12px] text-gray-400 hover:text-[#E24B4A] transition-colors">
            ✏️ Sửa →
          </Link>
        </div>
      )}
    </div>
  )
}
