import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import FlashcardSession from '@/components/flashcard/FlashcardSession'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Nhận filter từ URL params: /flashcard?type=vocab&source=music
export default async function FlashcardPage({ searchParams }) {
  const type   = searchParams?.type   ?? 'all'
  const source = searchParams?.source ?? 'all'

  let query = supabase
    .from('entries')
    .select('id, type, hanzi, pinyin, hv, meaning_vi, meaning_en, example, example_vi, notes')

  if (type   !== 'all') query = query.eq('type',   type)
  if (source !== 'all') query = query.eq('source', source)

  const [{ data: allEntries }, { flashcardCount }, { data: reviewLog }] = await Promise.all([
    query,
    getSettings(),
    // Lấy toàn bộ lịch sử review để tính score
    supabase.from('review_log').select('entry_id, result'),
  ])

  // ── Score-based priority ─────────────────────────────────────────────────
  // score = incorrect*2 - correct  (incorrect nặng hơn)
  // skip  = +1 (chưa chắc → vẫn cần ôn)
  // Chưa ôn bao giờ → score = null → ưu tiên cao nhất
  const scoreMap = {}
  reviewLog?.forEach(({ entry_id, result }) => {
    if (scoreMap[entry_id] === undefined) scoreMap[entry_id] = 0
    if (result === 'incorrect') scoreMap[entry_id] += 2
    else if (result === 'correct') scoreMap[entry_id] -= 1
    else if (result === 'skip')    scoreMap[entry_id] += 1
  })

  const sorted = [...(allEntries ?? [])].sort((a, b) => {
    const sa = scoreMap[a.id]   // undefined = chưa ôn
    const sb = scoreMap[b.id]
    // null/undefined → float lên đầu
    if (sa === undefined && sb === undefined) return 0
    if (sa === undefined) return -1
    if (sb === undefined) return 1
    return sb - sa  // score cao hơn lên trước
  })

  // Slice theo flashcard_count — đã sort theo độ khó
  const entries = sorted.slice(0, flashcardCount)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Flashcard</h1>
        <Link href="/" className="btn">← Dashboard</Link>
      </div>

      {/* Filter session trước khi bắt đầu */}
      <SessionFilter currentType={type} currentSource={source} />

      {entries.length > 0 ? (
        <FlashcardSession entries={entries} />
      ) : (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">Không có từ nào phù hợp.</p>
          <Link href="/vocab/new" className="btn btn-primary mt-4 inline-flex">
            + Thêm từ đầu tiên
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Filter bar — chọn trước khi bắt đầu session ─────────────────────────────
function SessionFilter({ currentType, currentSource }) {
  const types   = [['all','Tất cả'], ['vocab','Từ vựng'], ['pattern','Cấu trúc']]
  const sources = [['all','Mọi nguồn'], ['douyin','📱 Douyin'], ['music','🎵 Nhạc'], ['game','🎮 Game'], ['manual','✏️ Manual']]

  function buildUrl(type, source) {
    const p = new URLSearchParams()
    if (type   !== 'all') p.set('type',   type)
    if (source !== 'all') p.set('source', source)
    return `/flashcard${p.toString() ? '?' + p : ''}`
  }

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
        {types.map(([v, l]) => (
          <a key={v} href={buildUrl(v, currentSource)}
            className={`px-3 py-1 text-[13px] rounded-md transition-colors ${
              currentType === v ? 'bg-[#E24B4A] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>{l}</a>
        ))}
      </div>
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
        {sources.map(([v, l]) => (
          <a key={v} href={buildUrl(currentType, v)}
            className={`px-3 py-1 text-[13px] rounded-md transition-colors ${
              currentSource === v ? 'bg-[#E24B4A] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>{l}</a>
        ))}
      </div>
    </div>
  )
}
