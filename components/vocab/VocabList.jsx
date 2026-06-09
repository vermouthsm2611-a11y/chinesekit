'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PinyinText from '@/components/ui/PinyinText'

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
// Fallback về field example cũ (chỉ có hanzi) nếu chưa migrate
function getFirstExample(entry) {
  if (entry.examples?.length) return entry.examples[0]
  if (entry.example)          return { hanzi: entry.example, pinyin: null, vi: null }
  return null
}

export default function VocabList({ entries }) {
  const [search,    setSearch] = useState('')
  const [srcFilter, setSrc]    = useState('all')
  const [sort,      setSort]   = useState('newest')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()

    const result = entries.filter((e) => {
      const matchSearch =
        !q ||
        e.hanzi.includes(q) ||
        e.pinyin?.toLowerCase().includes(q) ||
        e.meaning_vi.toLowerCase().includes(q)
      const matchSrc = srcFilter === 'all' || e.source === srcFilter
      return matchSearch && matchSrc
    })

    result.sort((a, b) => {
      if (sort === 'az')     return a.hanzi.localeCompare(b.hanzi, 'zh')
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      return new Date(b.created_at) - new Date(a.created_at)
    })

    return result
  }, [entries, search, srcFilter, sort])

  const isFiltered = search || srcFilter !== 'all'

  return (
    <div>
      {/* ── Toolbar — sticky khi scroll ─────────────────── */}
      <div className="sticky top-0 z-10 bg-[#F7F7F5] pb-3 flex flex-col gap-2">
        <input
          type="search"
          placeholder="Tìm hanzi, pinyin, nghĩa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 text-[15px] border border-gray-200
                     rounded-lg bg-white outline-none focus:border-[#E24B4A] transition-colors"
        />

        {/* Filter row — cuộn ngang mobile, wrap desktop */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible
                        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      <p className="text-[14px] text-gray-400 mb-3">
        {filtered.length} từ{isFiltered ? ' (đã lọc)' : ''}
      </p>

      {/* ── List ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">
          Không tìm thấy từ nào.
        </div>
      ) : (
        <>
          {/* ── MOBILE: card rows ─────────────────────────── */}
          <div className="md:hidden card p-0 overflow-hidden divide-y divide-gray-50">
            {filtered.map((entry) => (
              <MobileRow key={entry.id} entry={entry} search={search} />
            ))}
          </div>

          {/* ── DESKTOP: table full-width ───────────────────── */}
          {/* Layout: Hanzi | Pinyin | Nghĩa | Ví dụ hanzi | Ví dụ pinyin/vi | Nguồn | Sửa */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-2.5 font-medium w-[120px]">Hanzi</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[120px]">Hán-Việt</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[140px]">Pinyin</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[200px]">Nghĩa</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[180px]">Ghi chú</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[200px]">Ví dụ</th>
                    <th className="text-left px-4 py-2.5 font-medium">Pinyin / Dịch</th>
                    <th className="text-left px-4 py-2.5 font-medium w-[80px]">Nguồn</th>
                    <th className="px-4 py-2.5 w-[60px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((entry) => {
                    const ex = getFirstExample(entry)
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 hanzi text-[22px] whitespace-nowrap align-middle">
                          {highlight(entry.hanzi, search)}
                        </td>
                        {/* Hán-Việt — muted, lowercase */}
                        <td className="px-4 py-3 text-gray-400 align-middle lowercase">
                          {entry.hv || '—'}
                        </td>
                        {/* Pinyin — tone colored, lowercase */}
                        <td className="px-4 py-3 align-middle lowercase">
                          {entry.pinyin
                            ? <PinyinText pinyin={entry.pinyin} />
                            : <span className="text-gray-200">—</span>}
                        </td>
                        {/* Nghĩa — đen, lowercase */}
                        <td className="px-4 py-3 text-[16px] text-gray-900 align-middle lowercase font-medium">
                          {highlight(entry.meaning_vi, search)}
                        </td>

                        {/* Ghi chú — đen */}
                        <td className="px-4 py-3 text-gray-900 align-middle lowercase">
                          {entry.notes
                            ? <p className="line-clamp-2">{entry.notes}</p>
                            : <span className="text-gray-200">—</span>
                          }
                        </td>

                        {/* Ví dụ hanzi — đen */}
                        <td className="px-4 py-3 hanzi text-[17px] text-gray-700 align-middle">
                          {ex ? ex.hanzi : <span className="text-gray-200">—</span>}
                        </td>

                        {/* Ví dụ pinyin + vi — muted, lowercase */}
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

                        {/* Nguồn — muted nhỏ */}
                        <td className="px-4 py-3 align-middle">
                          {entry.source}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <Link
                            href={`/vocab/${entry.id}`}
                            className="text-gray-400 hover:text-[#E24B4A] transition-colors"
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
      {/* Dòng 1: hanzi + pinyin inline */}
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="hanzi text-[22px] leading-tight text-gray-900">
          {highlight(entry.hanzi, search)}
        </span>
        {entry.pinyin && (
          <PinyinText pinyin={entry.pinyin} className="text-[14px] flex-shrink-0 lowercase" />
        )}
      </div>

      {/* Dòng 2: nghĩa */}
      <p className="text-[16px] text-gray-800 font-medium mb-2 lowercase">
        {highlight(entry.meaning_vi, search)}
      </p>

      {/* Ví dụ block — border-left accent, 3 dòng */}
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

// ── FilterGroup ──────────────────────────────────────────────────────────────
function FilterGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            'px-3 py-1.5 text-[13px] rounded-md transition-colors whitespace-nowrap',
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
