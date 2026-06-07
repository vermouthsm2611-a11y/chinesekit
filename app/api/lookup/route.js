// GET /api/lookup?hanzi=后悔
// Trả về pinyin + nghĩa tiếng Việt từ MyMemory (không cần API key)
// Dùng cho nút "Load" trong EntryForm

import { pinyin } from 'pinyin-pro'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const hanzi = searchParams.get('hanzi')?.trim()

  if (!hanzi) {
    return Response.json({ error: 'Missing hanzi' }, { status: 400 })
  }

  // ── 1. Pinyin — client-side lib, run server-side ở đây cho gọn ──────────
  const pinyinResult = pinyin(hanzi, { toneType: 'symbol', separator: ' ' })

  // ── 2. Nghĩa tiếng Việt — Google Translate unofficial (~5000 chars, no key) ─
  let meaningVi = ''
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=${encodeURIComponent(hanzi)}`
    const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h per word
    if (res.ok) {
      const data = await res.json()
      // GT trả: [ [ ["dịch", "gốc"], ... ], ... ]
      meaningVi = data[0]?.map(seg => seg[0]).join('').trim() ?? ''
    }
  } catch (_) {
    // translate fail → trả pinyin thôi, không sao
  }

  return Response.json({ pinyin: pinyinResult, meaning_vi: meaningVi })
}
