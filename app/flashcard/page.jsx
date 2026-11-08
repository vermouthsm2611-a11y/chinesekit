import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import FlashcardSession from '@/components/flashcard/FlashcardSession'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Interval (ngày) theo bucket: bucket 1 → 1 ngày, 2 → 3 ngày, 3 → 7 ngày
export const BUCKET_INTERVALS = [0, 1, 3, 7]

export default async function FlashcardPage({ searchParams }) {
  const type   = searchParams?.type   ?? 'all'

  // ── Fetch entries + entry_progress song song ────────────────────────────
  let entryQuery = supabase
    .from('entries')
    .select('id, type, hanzi, pinyin, hv, meaning_vi, meaning_en, example, example_vi, notes')

  if (type   !== 'all') entryQuery = entryQuery.eq('type',   type)

  const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

  const [{ data: allEntries }, { flashcardCount }, { data: progressRows }] = await Promise.all([
    entryQuery,
    getSettings(),
    // Chỉ cần bucket + next_review — không cần toàn bộ review_log
    supabase.from('entry_progress').select('entry_id, bucket, next_review'),
  ])

  // ── Build progressMap: entry_id → { bucket, next_review } ──────────────
  // Dùng trong page để filter + sort, và truyền xuống FlashcardSession để tính bucket mới
  const progressMap = {}
  progressRows?.forEach(row => {
    progressMap[row.entry_id] = { bucket: row.bucket, next_review: row.next_review }
  })

  // ── Filter: chỉ lấy entries đến hạn ôn hôm nay hoặc chưa học lần nào ──
  const dueEntries = (allEntries ?? []).filter(entry => {
    const progress = progressMap[entry.id]
    if (!progress) return true                    // chưa có trong entry_progress → ưu tiên cao nhất
    return progress.next_review <= today          // đến hạn hoặc quá hạn
  })

  // ── Sort: B1 → B2 → B3 → chưa học (float lên đầu) ─────────────────────
  const sorted = [...dueEntries].sort((a, b) => {
    const pa = progressMap[a.id]
    const pb = progressMap[b.id]
    const ba = pa?.bucket ?? 0   // 0 = chưa học, float lên đầu
    const bb = pb?.bucket ?? 0
    return ba - bb               // bucket nhỏ hơn (yếu hơn) lên trước
  })

  const entries = sorted.slice(0, flashcardCount)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[30px] font-semibold" style={{ color: 'var(--text-primary)' }}>Flashcard</h1>
        <Link href="/" className="btn">← Dashboard</Link>
      </div>

      <SessionFilter currentType={type} />

      {entries.length > 0 ? (
        <FlashcardSession
          entries={entries}
          progressMap={progressMap}
          today={today}
        />
      ) : (
        // Empty state — hôm nay không có gì cần ôn
        <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Hôm nay không có từ nào cần ôn!
          </p>
          <p className="text-sm mb-6">Quay lại ngày mai hoặc thêm từ mới.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/vocab/new" className="btn btn-primary">+ Thêm từ mới</Link>
            <Link href="/vocab" className="btn">Xem từ vựng</Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filter bar ───────────────────────────────────────────────────────────────
function SessionFilter({ currentType }) {
  const types   = [['all','Tất cả'], ['vocab','Từ vựng'], ['pattern','Cấu trúc']]

  function buildUrl(type) {
    const p = new URLSearchParams()
    if (type   !== 'all') p.set('type',   type)
    return `/flashcard${p.toString() ? '?' + p : ''}`
  }

  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible
                    [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-1 rounded-lg p-1 flex-shrink-0 border"
           style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        {types.map(([v, l]) => (
          <a key={v} href={buildUrl(v)}
            className={`px-4 py-1.5 text-[16px] rounded-md transition-colors whitespace-nowrap ${
              currentType === v ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-muted)]'
            }`}
            style={currentType !== v ? { color: 'var(--text-secondary)' } : {}}
          >{l}</a>
        ))}
      </div>
    </div>
  )
}
