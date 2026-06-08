'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// ── Lưu settings ─────────────────────────────────────────────────────────────
export async function saveSettings(prevState, formData) {
  const pairs = [
    { key: 'daily_goal',         value: formData.get('daily_goal')         || '20' },
    { key: 'flashcard_count',    value: formData.get('flashcard_count')    || '20' },
    { key: 'lyrics_show_pinyin', value: formData.get('lyrics_show_pinyin') || 'false' },
  ]

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
