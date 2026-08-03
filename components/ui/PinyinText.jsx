/**
 * PinyinText.jsx
 * Render chuỗi pinyin — 1 màu duy nhất (kế thừa màu chữ hiện tại).
 *
 * Trước đây tô màu theo tone (xem lib/toneColor.js), nhưng đã bỏ theo
 * yêu cầu để đơn giản hoá UI. lib/toneColor.js vẫn giữ lại phòng khi
 * cần bật lại tính năng này qua Settings sau này.
 *
 * Props:
 *   pinyin    {string} — chuỗi pinyin có dấu, vd: "nǐ hǎo"
 *   className {string} — class bổ sung (vd: text-[13px] lowercase)
 */
'use client'

export default function PinyinText({ pinyin, className = '' }) {
  if (!pinyin) return null

  return <span className={className}>{pinyin}</span>
}
