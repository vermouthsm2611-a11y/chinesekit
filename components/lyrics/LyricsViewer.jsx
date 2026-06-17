'use client'

import { useState, useCallback } from 'react'
import { pinyin } from 'pinyin-pro'
import { supabase } from '@/lib/supabase'
import WordPopup from './WordPopup'
import { detectTone, getToneColor } from '@/lib/toneColor'

// Chỉ ký tự CJK mới clickable
const CJK = /[一-鿿㐀-䶿豈-﫿]/

// Render 1 dòng hanzi — nếu showPinyin thì dùng <ruby> per ký tự
function HanziLine({ text, showPinyin, onCharClick }) {
  const chars = [...text]

  return (
    <p className="text-[32px] leading-loose tracking-wide" style={{ color: 'var(--text-primary)' }}>
      {chars.map((char, i) => {
        const isCJK = CJK.test(char)
        const py    = showPinyin && isCJK ? pinyin(char, { toneType: 'symbol' }) : null

        if (showPinyin && isCJK) {
          return (
            <ruby
              key={i}
              onClick={(e) => onCharClick(char, e)}
              className="cursor-pointer rounded px-0.5 transition-colors
                         hover:bg-[var(--pink-soft)] hover:text-[var(--pink)]
                         [ruby-align:center]"
              style={{ fontSize: '32px' }}
            >
              {char}
              {/* rt: pinyin phía trên — scale tỉ lệ với hanzi */}
              <rt style={{
                fontSize: '16px',
                color: getToneColor(detectTone(py ?? '')),
                fontWeight: 400,
                letterSpacing: 0,
              }}>
                {py}
              </rt>
            </ruby>
          )
        }

        return isCJK ? (
          <span
            key={i}
            onClick={(e) => onCharClick(char, e)}
            className="cursor-pointer rounded px-0.5 transition-colors
                       hover:bg-[var(--pink-soft)] hover:text-[var(--pink)]"
          >
            {char}
          </span>
        ) : (
          <span key={i} className="text-gray-400">{char}</span>
        )
      })}
    </p>
  )
}

export default function LyricsViewer({ lines, initialShowPinyin = false }) {
  const [popup,      setPopup]      = useState(null)
  const [showPinyin, setShowPinyin] = useState(initialShowPinyin)

  const handleCharClick = useCallback(async (char, event) => {
    event.stopPropagation()
    const rect = event.target.getBoundingClientRect()
    const pos  = { x: rect.left, y: rect.bottom }

    const { data } = await supabase
      .from('entries')
      .select('id, type, hanzi, pinyin, hv, meaning_vi, example')
      .or(`hanzi.eq.${char},hanzi.ilike.%${char}%`)
      .order('hanzi')
      .limit(8)

    setPopup({ char, entries: data ?? [], pos })
  }, [])

  return (
    <div className="relative">
      {/* Toggle pinyin — sticky để accessible khi đọc lyrics dài */}
      <div className="sticky top-0 z-10 flex justify-end pb-3"
           style={{ background: 'var(--bg-base)' }}>
        <button
          type="button"
          onClick={() => setShowPinyin(v => !v)}
          className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg
                      border transition-colors
                      ${showPinyin
                        ? 'border-[var(--pink)] bg-[var(--pink-soft)] text-[var(--pink)]'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
        >
          {showPinyin ? '拼 Ẩn pinyin' : '拼 Hiện pinyin'}
        </button>
      </div>

      {/* Lyrics */}
      <div className="space-y-6" onClick={() => setPopup(null)}>
        {lines.map((line) => (
          <div key={line.id} className="group">
            <HanziLine
              text={line.hanzi}
              showPinyin={showPinyin}
              onCharClick={handleCharClick}
            />

            {line.vietsub && (
              <p className="text-[18px] mt-1 transition-colors"
                 style={{ color: 'var(--text-muted)' }}
                 onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                 onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {line.vietsub}
              </p>
            )}
          </div>
        ))}
      </div>

      {popup && (
        <WordPopup
          char={popup.char}
          entries={popup.entries}
          pos={popup.pos}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
