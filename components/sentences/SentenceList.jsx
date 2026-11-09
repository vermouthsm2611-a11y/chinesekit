'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import PinyinText from '@/components/ui/PinyinText'
import DeleteIconButton from '@/components/ui/DeleteIconButton'
import Toast from '@/components/ui/Toast'
import useOptimisticDelete from '@/components/ui/useOptimisticDelete'
import { removeSentence } from '@/app/actions/sentences'

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

export default function SentenceList({ sentences: allSentences }) {
  const [search, setSearch] = useState('')
  // Xoá ngay trong danh sách: dòng ẩn tức thì, lỗi thì hiện lại
  const { removed, remove, error, clearError } = useOptimisticDelete(removeSentence)
  const sentences = useMemo(() => allSentences.filter(s => !removed.has(s.id)), [allSentences, removed])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return sentences
    return sentences.filter(s =>
      s.hanzi.includes(q) ||
      s.pinyin?.toLowerCase().includes(q) ||
      s.meaning_vi?.toLowerCase().includes(q)
    )
  }, [sentences, search])

  return (
    <div>
      <Toast message={error} type="error" onClose={clearError} />
      <div className="sticky top-0 z-10 pb-3" style={{ background: 'var(--bg-base)' }}>
        <input
          type="search"
          placeholder="Tìm câu, pinyin, nghĩa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input w-full"
        />
      </div>

      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} câu{search ? ' (đã lọc)' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
          Không tìm thấy câu nào.
        </div>
      ) : (
        <div className="card p-0 overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.map(s => (
            // Nút xoá nằm CẠNH link (không lồng <button> trong <a>)
            <div key={s.id} className="flex items-stretch">
            <Link
              href={`/sentences/${s.id}`}
              className="group block flex-1 min-w-0 px-5 py-3.5 transition-colors hover:bg-gray-50"
            >
              {/* Desktop: 3 cột — hanzi | pinyin | dịch */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr] md:items-center gap-x-6">
                <p className="hanzi text-[24px] leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {highlight(s.hanzi, search)}
                </p>
                <div>
                  {s.pinyin
                    ? <PinyinText pinyin={s.pinyin} className="text-[16px]" />
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>
                  }
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[17px] lowercase" style={{ color: 'var(--text-secondary)' }}>
                    {s.meaning_vi ? highlight(s.meaning_vi, search) : '—'}
                  </p>
                  <span className="flex-shrink-0 transition-colors text-sm"
                        style={{ color: 'var(--border-strong)' }}>→</span>
                </div>
              </div>

              {/* Mobile: stacked */}
              <div className="md:hidden">
                <p className="hanzi text-[22px] leading-snug mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {highlight(s.hanzi, search)}
                </p>
                {s.pinyin && (
                  <PinyinText pinyin={s.pinyin} className="text-[15px] mb-0.5" />
                )}
                {s.meaning_vi && (
                  <p className="text-[15px] lowercase" style={{ color: 'var(--text-secondary)' }}>
                    {highlight(s.meaning_vi, search)}
                  </p>
                )}
              </div>
            </Link>
            {/* w-11 = 44px: đủ vùng chạm trên mobile */}
            <DeleteIconButton label={s.hanzi.slice(0, 20)} onDelete={() => remove(s.id)} className="w-11 flex-shrink-0 rounded-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
