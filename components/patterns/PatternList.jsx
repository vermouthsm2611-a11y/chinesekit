'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PinyinText from '@/components/ui/PinyinText'

const PAGE_SIZE = 30

export default function PatternList({ patterns }) {
  const [search,       setSearch]       = useState('')
  const [expanded,     setExpanded]     = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const sentinelRef = useRef(null)

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

  // Reset về trang đầu khi search thay đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setExpanded(null) // đóng accordion đang mở tránh layout jump
  }, [search])

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || visibleCount >= filtered.length) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(n => Math.min(n + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length, visibleCount])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

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
      {/* Sticky search bar */}
      <div className="sticky top-0 z-10 pb-2" style={{ background: 'var(--bg-base)' }}>
        <input
          type="text"
          placeholder="Tìm cấu trúc, nghĩa, ví dụ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {/* Count */}
      {search && (
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} kết quả
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Không tìm thấy kết quả nào.
        </p>
      ) : (
        <>
          {visible.map(p => (
            <PatternCard
              key={p.id}
              pattern={p}
              isOpen={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            />
          ))}

          {/* Sentinel + spinner */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-[var(--primary)] animate-spin" />
            </div>
          )}
        </>
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
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
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

          {/* Col 2: ví dụ đầu tiên */}
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

        <div className="flex items-center justify-end gap-2 mt-3">
          {hasMore && (
            <span className="text-xs border rounded px-1.5 py-0.5"
                  style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
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
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ✏️ Sửa →
            </Link>
          </div>
        </div>
      )}

      {!hasMore && (
        <div className="px-5 pb-3 flex justify-end">
          <Link href={`/vocab/${pattern.id}?back=/patterns`}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✏️ Sửa →
          </Link>
        </div>
      )}
    </div>
  )
}
