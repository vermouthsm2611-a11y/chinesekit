'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PinyinText from '@/components/ui/PinyinText'

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
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Chưa có cấu trúc nào.</p>
        <Link href="/vocab/new?type=pattern" className="btn btn-primary inline-flex">
          + Thêm cấu trúc đầu tiên
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* sticky: search bar bám đầu viewport khi scroll qua list accordion dài */}
      <div className="sticky top-0 z-10 pb-2" style={{ background: 'var(--bg-base)' }}>
        <input
          type="text"
          placeholder="Tìm cấu trúc, nghĩa, ví dụ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Không tìm thấy kết quả nào.</p>
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
  const examples = pattern.examples?.length
    ? pattern.examples
    : pattern.example
      ? [{ hanzi: pattern.example, pinyin: '', vi: pattern.example_vi ?? '' }]
      : []

  const firstExample  = examples[0] ?? null
  const extraExamples = examples.slice(1)
  const hasMore       = extraExamples.length > 0 || !!pattern.notes

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header — horizontal layout trên desktop để tránh khoảng trống dọc */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        {/* Desktop: grid 2 cột bằng nhau — cùng cấu trúc row hanzi/pinyin/nghĩa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">

          {/* Col 1: cấu trúc */}
          <div>
            <p className="hanzi text-[26px] leading-snug" style={{ color: 'var(--text-primary)' }}>
              {pattern.hanzi}
            </p>
            {pattern.pinyin
              ? <PinyinText pinyin={pattern.pinyin} className="text-[17px] mt-1 block" />
              : <span className="block mt-1 text-[17px]" style={{ color: 'var(--text-muted)' }}>—</span>
            }
            <p className="text-[17px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
              {pattern.meaning_vi || <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </p>
          </div>

          {/* Col 2: ví dụ đầu tiên — cùng row structure, cùng size */}
          <div className="md:border-l md:pl-5" style={{ borderColor: 'var(--border)' }}>
            {firstExample ? (
              <>
                <p className="hanzi text-[26px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {firstExample.hanzi}
                </p>
                {firstExample.pinyin
                  ? <PinyinText pinyin={firstExample.pinyin} className="text-[17px] mt-1 block" />
                  : <span className="block mt-1 text-[17px]" style={{ color: 'var(--text-muted)' }}>—</span>
                }
                <p className="text-[17px] italic mt-1" style={{ color: 'var(--text-muted)' }}>
                  {firstExample.vi || '—'}
                </p>
              </>
            ) : (
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>Chưa có ví dụ</p>
            )}
          </div>
        </div>

        {/* Meta + expand — đặt ngoài grid, căn phải */}
        <div className="flex items-center justify-end gap-2 mt-3">
          {pattern.source && pattern.source !== 'manual' && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {SOURCE_LABELS[pattern.source]}
            </span>
          )}
          {hasMore && (
            <span className="text-xs border rounded px-1.5 py-0.5"
                  style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        </div>
      </button>

      {/* Expanded: ví dụ còn lại + ghi chú */}
      {isOpen && hasMore && (
        <div className="border-t px-5 py-4 flex flex-col gap-4"
             style={{ borderColor: 'var(--border)', background: 'var(--bg-muted)' }}>
          {extraExamples.map((ex, i) => (
            <div key={i} className="pl-3 border-l-2" style={{ borderColor: 'var(--border-strong)' }}>
              <p className="text-xs mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Ví dụ {i + 2}
              </p>
              <p className="hanzi text-[17px]" style={{ color: 'var(--text-secondary)' }}>{ex.hanzi}</p>
              {ex.pinyin && <PinyinText pinyin={ex.pinyin} className="text-sm mt-0.5 block" />}
              {ex.vi     && <p className="text-sm italic mt-0.5" style={{ color: 'var(--text-muted)' }}>{ex.vi}</p>}
            </div>
          ))}

          {pattern.notes && (
            <div>
              <p className="text-xs mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Ghi chú
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {pattern.notes}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Link href={`/vocab/${pattern.id}?back=/patterns`}
              className="text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--pink)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✏️ Sửa →
            </Link>
          </div>
        </div>
      )}

      {/* Edit link khi không có extra content */}
      {!hasMore && (
        <div className="px-5 pb-3 flex justify-end">
          <Link href={`/vocab/${pattern.id}?back=/patterns`}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--pink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✏️ Sửa →
          </Link>
        </div>
      )}
    </div>
  )
}
