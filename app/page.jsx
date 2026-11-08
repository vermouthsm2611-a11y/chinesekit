// Dashboard — Server Component
// force-dynamic cần thiết vì dashboard hiển thị: streak (tính theo ngày thực),
// reviewedToday (thay đổi real-time sau mỗi flashcard session), previewEntry random
// Phần flashcard / lyrics chỉ truy vấn + hiển thị khi bật trong lib/features.js
export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import { FEATURES } from '@/lib/features'
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

// ── Từng nhóm dữ liệu — chạy song song ở getDashboardData ────────────────────
async function getLibraryData() {
  const [
    { count: vocabCount },
    { count: patternCount },
    { count: sentenceCount },
    { data: recentEntries },
  ] = await Promise.all([
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'vocab'),
    supabase.from('entries').select('*', { count: 'exact', head: true }).eq('type', 'pattern'),
    supabase.from('sentences').select('*', { count: 'exact', head: true }),
    supabase.from('entries').select('id, type, hanzi, pinyin, meaning_vi').order('created_at', { ascending: false }).limit(5),
  ])
  return { vocabCount, patternCount, sentenceCount, recentEntries }
}

async function getFlashcardData() {
  if (!FEATURES.flashcard) return { reviewedToday: 0, streak: 0, previewEntry: null, dailyGoal: 0 }
  const today = new Date().toISOString().slice(0, 10)
  const [
    { count: reviewedToday },
    { data: reviewHistory },
    // 1 entry ngẫu nhiên cho flashcard preview (lấy 20, random ở JS)
    { data: sampleEntries },
    { dailyGoal },
  ] = await Promise.all([
    supabase.from('review_log').select('*', { count: 'exact', head: true }).gte('reviewed_at', today),
    supabase.from('review_log').select('reviewed_at').order('reviewed_at', { ascending: false }).limit(90),
    supabase.from('entries').select('id, hanzi, pinyin, hv, meaning_vi').limit(20),
    getSettings(),
  ])
  const previewEntry = sampleEntries?.length
    ? sampleEntries[Math.floor(Math.random() * sampleEntries.length)]
    : null
  return { reviewedToday, streak: computeStreak(reviewHistory), previewEntry, dailyGoal }
}

async function getSongs() {
  if (!FEATURES.lyrics) return []
  const { data } = await supabase.from('songs').select('id, title, artist').order('created_at', { ascending: false }).limit(3)
  return data ?? []
}

async function getDashboardData() {
  const [lib, fc, songs] = await Promise.all([getLibraryData(), getFlashcardData(), getSongs()])
  return { ...lib, ...fc, songs }
}

export default async function DashboardPage() {
  const {
    vocabCount, patternCount, sentenceCount, recentEntries,
    reviewedToday, streak, previewEntry, dailyGoal, songs,
  } = await getDashboardData()

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <div className="flex gap-2">
          <Link href="/vocab" className="btn">🔍 Tìm từ</Link>
          <Link href="/vocab/new" className="btn btn-primary">+ Thêm từ</Link>
        </div>
      </div>

      {/* Stat cards — class viết đủ cả 2 biến thể để Tailwind không purge */}
      <div className={`grid gap-3 mb-5 ${FEATURES.flashcard ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-3'}`}>
        <StatCard label="Từ vựng"  value={vocabCount    ?? 0} sub="entries" />
        <StatCard label="Cấu trúc" value={patternCount  ?? 0} sub="patterns" />
        <StatCard label="Câu"      value={sentenceCount ?? 0} sub="sentences" />
        {FEATURES.flashcard && (
          <>
            <StatCard label="Ôn hôm nay" value={reviewedToday ?? 0} sub={`/ ${dailyGoal} mục tiêu`} />
            {/* streak dùng accent=true để highlight bằng pink-soft */}
            <StatCard
              label="Streak 🔥"
              value={streak > 0 ? `${streak}` : '—'}
              sub="ngày liên tiếp"
              accent
            />
          </>
        )}
      </div>

      {/* Row 1 — không có flashcard thì "Mục mới thêm" giãn hết chiều ngang */}
      <div className={`grid grid-cols-1 gap-4 mb-4 ${FEATURES.flashcard ? 'md:grid-cols-2' : ''}`}>
        {FEATURES.flashcard && (
          <FlashcardPreview entry={previewEntry} reviewedToday={reviewedToday ?? 0} dailyGoal={dailyGoal} />
        )}
        <RecentEntries entries={recentEntries ?? []} />
      </div>

      {/* Row 2 — Bài hát (full width; thẻ "Nguồn học" đã bỏ cùng cột source) */}
      {FEATURES.lyrics && <SongsWidget songs={songs} />}
    </div>
  )
}
