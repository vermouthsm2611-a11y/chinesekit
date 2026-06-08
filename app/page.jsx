// Dashboard — Server Component
// force-dynamic cần thiết vì dashboard hiển thị: streak (tính theo ngày thực),
// reviewedToday (thay đổi real-time sau mỗi flashcard session), previewEntry random
export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import Link from 'next/link'
import StatCard from '@/components/dashboard/StatCard'
import RecentEntries from '@/components/dashboard/RecentEntries'
import FlashcardPreview from '@/components/dashboard/FlashcardPreview'
import SongsWidget from '@/components/dashboard/SongsWidget'

// ── Tính streak từ mảng reviewed_at ──────────────────────────────────────────
function computeStreak(reviews) {
  if (!reviews?.length) return 0

  // Lấy danh sách ngày duy nhất, sort giảm dần
  const dates = [...new Set(reviews.map(r => r.reviewed_at.slice(0, 10)))]
    .sort()
    .reverse()

  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Nếu ngày gần nhất không phải hôm nay hoặc hôm qua → streak = 0
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    // Khoảng cách giữa 2 ngày liên tiếp phải đúng 1 ngày
    if ((prev - curr) / 86400000 === 1) streak++
    else break
  }
  return streak
}

async function getDashboardData() {
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: vocabCount },
    { count: patternCount },
    { count: reviewedToday },
    { data: recentEntries },
    { data: songs },
    { data: reviewHistory },
    // Source counts song song
    { count: cntDouyin },
    { count: cntMusic },
    { count: cntGame },
    { count: cntManual },
    // 1 entry ngẫu nhiên cho flashcard preview (lấy 20, random ở JS)
    { data: sampleEntries },
  ] = await Promise.all([
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'vocab'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'pattern'),
    supabase.from('review_log').select('*', { count: 'exact', head: true }).gte('reviewed_at', today),
    supabase.from('entries').select('id, type, hanzi, pinyin, meaning_vi').order('created_at', { ascending: false }).limit(5),
    supabase.from('songs').select('id, title, artist').order('created_at', { ascending: false }).limit(3),
    supabase.from('review_log').select('reviewed_at').order('reviewed_at', { ascending: false }).limit(90),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'douyin'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'music'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'game'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('source', 'manual'),
    supabase.from('entries').select('id, hanzi, pinyin, hv, meaning_vi').limit(20),
  ])

  const streak = computeStreak(reviewHistory)

  // Chọn 1 entry ngẫu nhiên từ 20 entries đầu
  const previewEntry = sampleEntries?.length
    ? sampleEntries[Math.floor(Math.random() * sampleEntries.length)]
    : null

  const sourceCounts = [
    { label: 'Douyin', emoji: '📱', color: 'bg-blue-50 text-blue-700',   count: cntDouyin ?? 0 },
    { label: 'Nhạc',   emoji: '🎵', color: 'bg-green-50 text-green-700', count: cntMusic  ?? 0 },
    { label: 'Game',   emoji: '🎮', color: 'bg-purple-50 text-purple-700', count: cntGame ?? 0 },
    { label: 'Manual', emoji: '✏️', color: 'bg-gray-100 text-gray-600',  count: cntManual ?? 0 },
  ]

  return {
    vocabCount, patternCount, reviewedToday, streak,
    recentEntries, songs, previewEntry, sourceCounts,
  }
}

export default async function DashboardPage() {
  const [dashData, { dailyGoal }] = await Promise.all([
    getDashboardData(),
    getSettings(),
  ])
  const {
    vocabCount, patternCount, reviewedToday, streak,
    recentEntries, songs, previewEntry, sourceCounts,
  } = dashData

  const totalEntries = (vocabCount ?? 0) + (patternCount ?? 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/vocab" className="btn">🔍 Tìm từ</Link>
          <Link href="/vocab/new" className="btn btn-primary">+ Thêm từ</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Từ vựng"    value={vocabCount   ?? 0} sub="entries" />
        <StatCard label="Cấu trúc"   value={patternCount ?? 0} sub="patterns" />
        <StatCard label="Ôn hôm nay" value={reviewedToday ?? 0} sub={`/ ${dailyGoal} mục tiêu`} />
        <StatCard
          label="Streak"
          value={streak > 0 ? `${streak} 🔥` : '—'}
          sub="ngày liên tiếp"
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FlashcardPreview entry={previewEntry} reviewedToday={reviewedToday ?? 0} dailyGoal={dailyGoal} />
        <RecentEntries entries={recentEntries ?? []} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SongsWidget songs={songs ?? []} />

        {/* Source breakdown — real counts */}
        <div className="card">
          <p className="text-[13px] font-medium text-gray-800 mb-4">📌 Nguồn học</p>
          <div className="flex flex-col gap-3">
            {sourceCounts.map(({ label, emoji, color, count }) => {
              const pct = totalEntries > 0 ? (count / totalEntries) * 100 : 0
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`badge ${color}`}>{emoji} {label}</span>
                    <span className="text-[12px] text-gray-500 font-medium">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#E24B4A] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
