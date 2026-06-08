'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// Highlight: bọc phần match trong <mark>, trả về array of React nodes
function highlight(text, query) {
  if (!text) return text
  if (!query) return text

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

export default function VocabList({ entries }) {
  const [search,     setSearch]  = useState('')
  const [typeFilter, setType]    = useState('all')
  const [srcFilter,  setSrc]     = useState('all')
  const [sort,       setSort]    = useState('newest') // 'newest' | 'oldest' | 'az'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()

    const result = entries.filter((e) => {
      const matchSearch =
        !q ||
        e.hanzi.includes(q) ||
        e.pinyin?.toLowerCase().includes(q) ||
        e.meaning_vi.toLowerCase().includes(q)
      const matchType = typeFilter === 'all' || e.type === typeFilter
      const matchSrc  = srcFilter  === 'all' || e.source === srcFilter
      return matchSearch && matchType && matchSrc
    })

    // Sort
    result.sort((a, b) => {
      if (sort === 'az')     return a.hanzi.localeCompare(b.hanzi, 'zh')
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      // newest (default)
      return new Date(b.created_at) - new Date(a.created_at)
    })

    return result
  }, [entries, search, typeFilter, srcFilter, sort])

  const isFiltered = search || typeFilter !== 'all' || srcFilter !== 'all'

  return (
    <div>
      {/* ── Toolbar — sticky khi scroll ─────────────────── */}
      <div className="sticky top-0 z-10 bg-[#F7F7F5] pb-3 flex flex-col gap-2">
        {/* Search — full width */}
        <input
          type="search"
          placeholder="Tìm hanzi, pinyin, nghĩa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200
                     rounded-lg bg-white outline-none focus:border-[#E24B4A] transition-colors"
        />

        {/* Filter row — scroll ngang trên mobile, wrap trên desktop */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible
                        scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
          <FilterGroup
            value={typeFilter}
            onChange={setType}
            options={[
              { value: 'all',     label: 'Tất cả' },
              { value: 'vocab',   label: 'Từ vựng' },
              { value: 'pattern', label: 'Cấu trúc' },
            ]}
          />
          <FilterGroup
            value={srcFilter}
            onChange={setSrc}
            options={[
              { value: 'all',    label: 'Mọi nguồn' },
              { value: 'douyin', label: '📱 Douyin' },
              { value: 'music',  label: '🎵 Nhạc' },
              { value: 'game',   label: '🎮 Game' },
              { value: 'manual', label: '✏️ Manual' },
            ]}
          />
          <FilterGroup
            value={sort}
            onChange={setSort}
            options={[
              { value: 'newest', label: '↓ Mới nhất' },
              { value: 'oldest', label: '↑ Cũ nhất' },
              { value: 'az',     label: 'A–Z' },
            ]}
          />
        </div>
      </div>

      {/* ── Count ───────────────────────────────────────── */}
      <p className="text-[12px] text-gray-400 mb-3">
        {filtered.length} entries{isFiltered ? ' (đã lọc)' : ''}
      </p>

      {/* ── List ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">
          Không tìm thấy entry nào.
        </div>
      ) : (
        <>
          {/* ── MOBILE: card rows (hidden trên md+) ───────── */}
          <div className="md:hidden card p-0 overflow-hidden divide-y divide-gray-50">
            {filtered.map((entry) => (
              <MobileRow key={entry.id} entry={entry} search={search} />
            ))}
          </div>

          {/* ── DESKTOP: table (hidden trên mobile) ───────── */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium">Hanzi</th>
                    <th className="text-left px-4 py-2.5 font-medium">Pinyin</th>
                    <th className="text-left px-4 py-2.5 font-medium">Nghĩa</th>
                    <th className="text-left px-4 py-2.5 font-medium">Loại</th>
                    <th className="text-left px-4 py-2.5 font-medium">Nguồn</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 hanzi text-[17px]">
                        {highlight(entry.hanzi, search)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-[13px]">
                        {entry.pinyin ? highlight(entry.pinyin, search) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[220px]">
                        <p className="truncate">{highlight(entry.meaning_vi, search)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${entry.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'}`}>
                          {entry.type === 'vocab' ? 'từ vựng' : 'cấu trúc'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-400">{entry.source}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/vocab/${entry.id}`}
                          className="text-[12px] text-gray-400 hover:text-[#E24B4A] transition-colors"
                        >
                          Sửa →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── MobileRow — card row layout cho màn hình nhỏ ────────────────────────────
// Pattern: hanzi lớn bên trái (fixed width, không wrap) + info stack bên phải
// Tham khảo: Pleco, HelloChinese — hanzi là focal point, meta thu gọn 1 dòng
function MobileRow({ entry, search }) {
  const badgeClass = entry.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'
  const badgeLabel = entry.type === 'vocab' ? 'từ vựng' : 'cấu trúc'

  return (
    <Link
      href={`/vocab/${entry.id}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      {/* Zone trái: hanzi — fixed width, không wrap, font lớn */}
      <div className="w-14 flex-shrink-0 flex items-center justify-center">
        <span className="hanzi text-[22px] leading-tight text-gray-900 whitespace-nowrap">
          {highlight(entry.hanzi, search)}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-100 flex-shrink-0" />

      {/* Zone phải: thông tin stack dọc */}
      <div className="flex-1 min-w-0">
        {/* Pinyin */}
        {entry.pinyin && (
          <p className="text-[12px] text-gray-400 leading-tight mb-0.5">
            {highlight(entry.pinyin, search)}
          </p>
        )}
        {/* Nghĩa — truncate nếu quá dài */}
        <p className="text-[14px] text-gray-800 font-medium truncate leading-snug">
          {highlight(entry.meaning_vi, search)}
        </p>
        {/* Meta: badge + nguồn trên 1 dòng */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`badge ${badgeClass} text-[10px] px-1.5 py-0.5`}>
            {badgeLabel}
          </span>
          {entry.source && entry.source !== 'manual' && (
            <span className="text-[11px] text-gray-300">·</span>
          )}
          {entry.source && entry.source !== 'manual' && (
            <span className="text-[11px] text-gray-400">{entry.source}</span>
          )}
        </div>
      </div>

      {/* Arrow — tap indicator */}
      <span className="text-gray-200 text-[14px] flex-shrink-0">›</span>
    </Link>
  )
}

// ── FilterGroup ──────────────────────────────────────────────────────────────
function FilterGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'px-2.5 py-1 text-[12px] rounded-md transition-colors',
            value === opt.value
              ? 'bg-[#E24B4A] text-white'
              : 'text-gray-500 hover:bg-gray-100',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
