'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import PinyinText from '@/components/ui/PinyinText'

const PAGE_SIZE = 50

// Fisher-Yates — unbiased shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Highlight match trong search — trả về React nodes
function highlight(text, query) {
  if (!text || !query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// Lấy object ví dụ đầu tiên — trả về { hanzi, pinyin, vi } hoặc null
// Fallback về field example cũ nếu chưa migrate
function getFirstExample(entry) {
  if (entry.examples?.length) return entry.examples[0]
  if (entry.example)          return { hanzi: entry.example, pinyin: null, vi: null }
  return null
}

export default function VocabList({ entries }) {
  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState('newest')
  // shuffleSeed tăng mỗi lần click "Random" khi đã ở random → trigger re-shuffle
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // sentinel ref cho IntersectionObserver
  const sentinelRef = useRef(null)

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()

    const result = entries.filter((e) => {
      const matchSearch =
        !q ||
        e.hanzi.includes(q) ||
        e.pinyin?.toLowerCase().includes(q) ||
        e.meaning_vi.toLowerCase().includes(q)
      return matchSearch
    })

    if (sort === 'az')     result.sort((a, b) => a.hanzi.localeCompare(b.hanzi, 'zh'))
    else if (sort === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    else if (sort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    else if (sort === 'random') return shuffle(result) // shuffleSeed trong deps → re-run khi seed tăng

    return result
  }, [entries, search, sort, shuffleSeed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset về trang đầu khi filter/sort thay đổi
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, sort, shuffleSeed])

  // ── Infinite scroll — IntersectionObserver ────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current
    // Không attach nếu đã load hết
    if (!el || visibleCount >= filtered.length) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(n => Math.min(n + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '300px' } // pre-load trước khi chạm đáy 300px
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length, visibleCount])

  // ── Slice visible items ────────────────────────────────────────────────────
  const visible   = filtered.slice(0, visibleCount)
  const hasMore   = visibleCount < filtered.length
  const isFiltered = !!search

  // ── Sort change handler — handle re-shuffle khi đã ở random ───────────────
  function handleSortChange(val) {
    if (val === 'random' && sort === 'random') {
      setShuffleSeed(s => s + 1) // giữ sort='random', chỉ tăng seed để re-shuffle
    } else {
      setSort(val)
    }
  }

  return (
    <div>
      {/* ── Toolbar sticky ────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 pb-3 flex flex-col gap-2"
           style={{ background: 'var(--bg-base)' }}>
        <input
          type="search"
          placeholder="Tìm hanzi, pinyin, nghĩa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 text-[15px] border border-gray-200
                     rounded-lg bg-white outline-none focus:border-[var(--primary)] transition-colors"
        />

        <div className="flex gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible
                        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterGroup
            value={sort}
            onChange={handleSortChange}
            options={[
              { value: 'newest', label: '↓ Mới nhất' },
              { value: 'oldest', label: '↑ Cũ nhất' },
              { value: 'az',     label: 'A–Z' },
              { value: 'random', label: '🔀 Random' },
            ]}
          />
        </div>
      </div>

      {/* ── Count ─────────────────────────────────────────────────────────── */}
      <p className="text-[14px] mb-3" style={{ color: 'var(--text-muted)' }}>
        {hasMore
          ? `Hiển thị ${visibleCount} / ${filtered.length} từ${isFiltered ? ' (đã lọc)' : ''}`
          : `${filtered.length} từ${isFiltered ? ' (đã lọc)' : ''}`
        }
      </p>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <div className="card text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
          Không tìm thấy từ nào.
        </div>
      ) : (
        <>
          {/* MOBILE: card rows */}
          <div className="md:hidden card p-0 overflow-hidden divide-y divide-gray-50">
            {visible.map((entry) => (
              <MobileRow key={entry.id} entry={entry} search={search} />
            ))}
          </div>

          {/* DESKTOP: table */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[13px] text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium w-[120px]">Hanzi</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[120px]">Hán-Việt</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[140px]">Pinyin</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[200px]">Nghĩa</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[180px]">Ghi chú</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[200px]">Ví dụ</th>
                    <th className="text-left px-4 py-2.5 font-medium">Pinyin / Dịch</th>
                    <th className="px-4 py-2.5 w-[60px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((entry) => {
                    const ex = getFirstExample(entry)
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 hanzi text-[22px] whitespace-nowrap align-middle">
                          {highlight(entry.hanzi, search)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 align-middle lowercase">
                          {entry.hv || '—'}
                        </td>
                        <td className="px-4 py-3 align-middle lowercase">
                          {entry.pinyin
                            ? <PinyinText pinyin={entry.pinyin} />
                            : <span className="text-gray-200">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[16px] text-gray-900 align-middle lowercase font-medium">
                          {highlight(entry.meaning_vi, search)}
                        </td>
                        <td className="px-4 py-3 text-gray-900 align-middle lowercase">
                          {entry.notes
                            ? <p className="line-clamp-2">{entry.notes}</p>
                            : <span className="text-gray-200">—</span>}
                        </td>
                        <td className="px-4 py-3 hanzi text-[17px] text-gray-700 align-middle">
                          {ex ? ex.hanzi : <span className="text-gray-200">—</span>}
                        </td>
                        <td className="px-4 py-3 align-middle lowercase">
                          {ex ? (
                            <div className="flex flex-col gap-0.5">
                              {ex.pinyin && <PinyinText pinyin={ex.pinyin} className="text-[14px] lowercase" />}
                              {ex.vi && <p>{ex.vi}</p>}
                            </div>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Link
                            href={`/vocab/${entry.id}`}
                            className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                          >
                            Sửa →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sentinel + loading indicator */}
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

// ── MobileRow ────────────────────────────────────────────────────────────────
function MobileRow({ entry, search }) {
  const ex = getFirstExample(entry)

  return (
    <Link
      href={`/vocab/${entry.id}`}
      className="block px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="hanzi text-[22px] leading-tight text-gray-900">
          {highlight(entry.hanzi, search)}
        </span>
        {entry.pinyin && (
          <PinyinText pinyin={entry.pinyin} className="text-[14px] flex-shrink-0 lowercase" />
        )}
      </div>

      <p className="text-[16px] text-gray-800 font-medium mb-2 lowercase">
        {highlight(entry.meaning_vi, search)}
      </p>

      {ex && (
        <div className="border-l-2 border-gray-100 pl-2.5 flex flex-col gap-0.5">
          <p className="hanzi text-[17px] text-gray-600">{ex.hanzi}</p>
          {ex.pinyin && (
            <PinyinText pinyin={ex.pinyin} className="text-[14px] lowercase" />
          )}
          {ex.vi && (
            <p className="text-[14px] text-gray-400 italic lowercase">{ex.vi}</p>
          )}
        </div>
      )}
    </Link>
  )
}

// ── FilterGroup ───────────────────────────────────────────────────────────────
function FilterGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-1 rounded-lg p-1 flex-shrink-0 border"
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'px-4 py-2 text-[16px] rounded-md transition-colors whitespace-nowrap',
            value === opt.value
              ? 'bg-[var(--primary)] text-white'
              : 'hover:bg-[var(--bg-muted)]',
          ].join(' ')}
          style={value !== opt.value ? { color: 'var(--text-secondary)' } : {}}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
