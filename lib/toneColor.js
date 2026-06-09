/**
 * toneColor.js
 * Detect tone number từ 1 syllable pinyin có dấu → trả về màu tương ứng.
 *
 * Tone map (chuẩn học tiếng Trung):
 *   1 (bằng)   → đỏ     #E24B4A
 *   2 (sắc)    → xanh lá #16a34a
 *   3 (hỏi)    → xanh dương #2563eb
 *   4 (nặng)   → tím    #7c3aed
 *   5 (nhẹ/neutral) → xám #9ca3af
 */

// Ký tự có dấu → số thanh điệu
const TONE_MAP = {
  // Tone 1 — macron (ā)
  'ā':1,'ē':1,'ī':1,'ō':1,'ū':1,'ǖ':1,
  'Ā':1,'Ē':1,'Ī':1,'Ō':1,'Ū':1,'Ǖ':1,
  // Tone 2 — acute (á)
  'á':2,'é':2,'í':2,'ó':2,'ú':2,'ǘ':2,
  'Á':2,'É':2,'Í':2,'Ó':2,'Ú':2,'Ǘ':2,
  // Tone 3 — caron (ǎ)
  'ǎ':3,'ě':3,'ǐ':3,'ǒ':3,'ǔ':3,'ǚ':3,
  'Ǎ':3,'Ě':3,'Ǐ':3,'Ǒ':3,'Ǔ':3,'Ǚ':3,
  // Tone 4 — grave (à)
  'à':4,'è':4,'ì':4,'ò':4,'ù':4,'ǜ':4,
  'À':4,'È':4,'Ì':4,'Ò':4,'Ù':4,'Ǜ':4,
}

const COLORS = {
  1: '#E24B4A', // đỏ   — tone bằng (flat)
  2: '#16a34a', // xanh lá — tone sắc (rising)
  3: '#2563eb', // xanh dương — tone hỏi (dipping)
  4: '#7c3aed', // tím  — tone nặng (falling)
  5: '#9ca3af', // xám  — tone nhẹ/neutral
}

/**
 * Detect tone number (1–5) từ 1 syllable pinyin.
 * Scan từng ký tự — syllable nào có dấu thì trả về tone tương ứng.
 * Nếu không tìm thấy dấu → tone 5 (neutral).
 *
 * @param {string} syllable — vd: "nǐ", "hǎo", "ma"
 * @returns {1|2|3|4|5}
 */
export function detectTone(syllable) {
  for (const ch of syllable) {
    const t = TONE_MAP[ch]
    if (t) return t
  }
  return 5
}

/**
 * Lấy màu hex cho 1 tone number.
 * @param {1|2|3|4|5} tone
 * @returns {string} hex color
 */
export function getToneColor(tone) {
  return COLORS[tone] ?? COLORS[5]
}

/**
 * Parse chuỗi pinyin nhiều âm tiết → mảng { text, color }.
 * Split theo space, giữ lại khoảng trắng giữa các syllable.
 *
 * @param {string} pinyinStr — vd: "nǐ hǎo" hoặc "wǒ ài nǐ"
 * @returns {{ text: string, color: string }[]}
 */
export function parsePinyinColors(pinyinStr) {
  if (!pinyinStr) return []
  const parts = pinyinStr.trim().split(/(\s+)/)
  return parts.map((part) => {
    // Khoảng trắng → giữ nguyên, không tô màu
    if (/^\s+$/.test(part)) return { text: part, color: 'inherit' }
    const tone  = detectTone(part)
    const color = getToneColor(tone)
    return { text: part, color }
  })
}
