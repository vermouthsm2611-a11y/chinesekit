export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import ActivityChart from '@/components/stats/ActivityChart'
import ResultsDonut from '@/components/stats/ResultsDonut'

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeStreak(reviews) {
  if (!reviews?.length) return { current: 0, best: 0 }
  const dates = [...new Set(reviews.map(r => r.reviewed_at.slice(0, 10)))].sort().reverse()
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let current = 0
  if (dates[0] === today || dates[0] === yesterday) {
    current = 1
    for (let i = 1; i < dates.length; i++) {
      if ((new Date(dates[i - 1]) - new Date(dates[i])) / 86400000 === 1) current++
      else break
    }
  }

  // Best streak
  let best = 1, run = 1
  const asc = [...dates].reverse()
  for (let i = 1; i < asc.length; i++) {
    if ((new Date(asc[i]) - new Date(asc[i - 1])) / 86400000 === 1) { run++; best = Math.max(best, run) }
    else run = 1
  }

  return { current, best: Math.max(best, current) }
}

async function getStats() {
  const fourteenDaysAgo = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10)
  const ninetyDaysAgo   = new Date(Date.now() - 89 * 86400000).toISOString().slice(0, 10)

  const [
    { count: vocabCount },
    { count: patternCount },
    { count: songCount },
    { count: totalReviews },
    { data: recentActivity },   // 14 ngày gần nhất — để vẽ chart
    { data: allReviewDates },   // 90 ngày — để tính streak
    { data: topReviewed },      // top entries được ôn nhiều nhất
    { count: cntDouyin },
    { count: cntMusic },
    { count: cntGame },
    { count: cntManual },
  ] = await Promise.all([
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'vocab'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'pattern'),
    supabase.from('songs').select('*', { count: 'exact', head: true }),
    supabase.from('review_log').select('*', { count: 'exact', head: true }),
    supabase.from('review_log').select('result, reviewed_at').gte('reviewed_at', fourteenDaysAgo),
    supabase.from('review_log').select('reviewed_at').gte('reviewed_at', ninetyDaysAgo),
    // Top 5 entries reviewed most — fetch last 200 reviews, count in JS
    supabase.from('review_log')
      .select('entry_id, result, entries(hanzi, meaning_vi)')
      .order('reviewed_at', { ascending: false })
      .limit(200),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'douyin'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'music'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'game'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'manual'),
  ])

  // ── Activity: group by date (14 ngày) ─────────────────────────────────────
  const countByDate = {}
  recentActivity?.forEach(r => {
    const d = r.reviewed_at.slice(0, 10)
    countByDate[d] = (countByDate[d] || 0) + 1
  })
  const activityDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10)
    return { date: d, count: countByDate[d] || 0 }
  })

  // ── Result breakdown ───────────────────────────────────────────────────────
  const results = { correct: 0, incorrect: 0, skip: 0 }
  recentActivity?.forEach(r => { if (results[r.result] !== undefined) results[r.result]++ })

  // ── Streak ─────────────────────────────────────────────────────────────────
  const streak = computeStreak(allReviewDates)

  // ── Top reviewed entries ───────────────────────────────────────────────────
  const entryCount = {}
  const entryMeta  = {}
  topReviewed?.forEach(r => {
    entryCount[r.entry_id] = (entryCount[r.entry_id] || 0) + 1
    if (!entryMeta[r.entry_id] && r.entries) entryMeta[r.entry_id] = r.entries
  })
  const topEntries = Object.entries(entryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count, ...entryMeta[id] }))

  // ── Source counts ──────────────────────────────────────────────────────────
  const totalEntries = (vocabCount ?? 0) + (patternCount ?? 0)
  const sources = [
    { label: 'Douyin', emoji: '📱', count: cntDouyin ?? 0 },
    { label: 'Nhạc',   emoji: '🎵', count: cntMusic  ?? 0 },
    { label: 'Game',   emoji: '🎮', count: cntGame   ?? 0 },
    { label: 'Manual', emoji: '✏️', count: cntManual ?? 0 },
  ]

  return {
    vocabCount, patternCount, songCount, totalReviews,
    activityDays, results, streak, topEntries, sources, totalEntries,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function StatsPage() {
  const {
    vocabCount, patternCount, songCount, totalReviews,
    activityDays, results, streak, topEntries, sources, totalEntries,
  } = await getStats()

  const totalRecent = results.correct + results.incorrect + results.skip

  return (
    <div>
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Thống kê</h1>

      {/* ── Row 1: Summary cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Từ vựng',     value: vocabCount   ?? 0, sub: 'entries' },
          { label: 'Cấu trúc',    value: patternCount ?? 0, sub: 'patterns' },
          { label: 'Bài hát',     value: songCount    ?? 0, sub: 'songs' },
          { label: 'Tổng lượt ôn',value: totalReviews ?? 0, sub: 'reviews all-time' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card">
            <p className="text-[14px] text-gray-400 mb-2">{label}</p>
            <p className="text-4xl font-medium text-gray-900">{value}</p>
            <p className="text-[14px] text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Streak cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card flex items-center gap-4">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-2xl font-medium text-gray-900">{streak.current} ngày</p>
            <p className="text-[13px] text-gray-400">Streak hiện tại</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-2xl font-medium text-gray-900">{streak.best} ngày</p>
            <p className="text-[13px] text-gray-400">Streak tốt nhất</p>
          </div>
        </div>
      </div>

      {/* ── Row 3: Activity chart (14 ngày) ──────────────────────────────── */}
      <div className="card mb-5">
        <p className="text-[14px] font-medium text-gray-800 mb-4">📅 Hoạt động 14 ngày qua</p>
        <ActivityChart days={activityDays} />
      </div>

      {/* ── Row 4: Results + Source ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-5">

        {/* Kết quả ôn tập */}
        <div className="card">
          <p className="text-[14px] font-medium text-gray-800 mb-4">🎯 Kết quả ôn tập (14 ngày)</p>
          {totalRecent === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-6">Chưa có dữ liệu</p>
          ) : (
            <ResultsDonut results={results} total={totalRecent} />
          )}
        </div>

        {/* Nguồn học */}
        <div className="card">
          <p className="text-[14px] font-medium text-gray-800 mb-4">📌 Nguồn học</p>
          <div className="flex flex-col gap-3">
            {sources.map(({ label, emoji, count }) => {
              const pct = totalEntries > 0 ? (count / totalEntries) * 100 : 0
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] text-gray-600">{emoji} {label}</span>
                    <span className="text-[13px] font-medium text-gray-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E24B4A] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 5: Top reviewed ───────────────────────────────────────────── */}
      {topEntries.length > 0 && (
        <div className="card">
          <p className="text-[14px] font-medium text-gray-800 mb-4">🔁 Ôn nhiều nhất (gần đây)</p>
          <div className="flex flex-col gap-2">
            {topEntries.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-[12px] text-gray-300 w-4">{i + 1}</span>
                <span className="hanzi text-[20px] flex-1">{e.hanzi}</span>
                <span className="text-[14px] text-gray-500 flex-1">{e.meaning_vi}</span>
                <span className="text-[13px] font-medium text-gray-400">{e.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
