'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// ── Lưu settings ─────────────────────────────────────────────────────────────
export async function saveSettings(prevState, formData) {
  // Chỉ lưu field ĐANG hiện trên form (lib/features.js có thể ẩn bớt section) — field ẩn mà vẫn
  // ghi thì giá trị mặc định sẽ đè giá trị cũ trong DB.
  const pairs = []
  if (formData.has('daily_goal'))
    pairs.push({ key: 'daily_goal',      value: formData.get('daily_goal')      || '20' })
  if (formData.has('flashcard_count'))
    pairs.push({ key: 'flashcard_count', value: formData.get('flashcard_count') || '20' })
  // checkbox bỏ tick thì không gửi gì -> dựa vào marker lyrics_section để biết section có hiện
  if (formData.has('lyrics_section'))
    pairs.push({ key: 'lyrics_show_pinyin', value: formData.get('lyrics_show_pinyin') || 'false' })
  if (!pairs.length) return

  // Upsert tất cả trong 1 lần thay vì 3 sequential calls
  const { error } = await supabase
    .from('settings')
    .upsert(pairs, { onConflict: 'key' })
  if (error) return { error: `Lỗi lưu settings: ${error.message}` }

  // Settings chỉ ảnh hưởng đến settings page và flashcard (dùng flashcard_count)
  // Dashboard cũng dùng dailyGoal — revalidate luôn
  revalidatePath('/settings')
  revalidatePath('/flashcard')
  revalidatePath('/')
}

// ── Xoá toàn bộ review history ────────────────────────────────────────────────
export async function clearReviewLog() {
  const { error } = await supabase.from('review_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(error.message)
  // clearReviewLog ảnh hưởng stats (chart, streak) và flashcard (score reset)
  revalidatePath('/stats')
  revalidatePath('/flashcard')
  revalidatePath('/')
}
