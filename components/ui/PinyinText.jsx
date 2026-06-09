/**
 * PinyinText.jsx
 * Render chuỗi pinyin với màu theo tone của từng âm tiết.
 *
 * Props:
 *   pinyin   {string}  — chuỗi pinyin có dấu, vd: "nǐ hǎo"
 *   className {string} — class bổ sung (vd: text-[12px] lowercase)
 *
 * Dùng thay cho <span className="text-gray-400">{entry.pinyin}</span>
 * ở mọi nơi trong app.
 */
'use client'

import { parsePinyinColors } from '@/lib/toneColor'

export default function PinyinText({ pinyin, className = '' }) {
  if (!pinyin) return null

  const parts = parsePinyinColors(pinyin)

  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i} style={{ color: part.color }}>
          {part.text}
        </span>
      ))}
    </span>
  )
}
