'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

// ── Lưu settings ─────────────────────────────────────────────────────────────
export async function saveSettings(formData) {
  const pairs = [
    { key: 'daily_goal',         value: formData.get('daily_goal')         || '20' },
    { key: 'flashcard_count',    value: formData.get('flashcard_count')    || '20' },
    { key: 'lyrics_show_pinyin', value: formData.get('lyrics_show_pinyin') || 'false' },
  ]

  for (const { key, value } of pairs) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
}

// ── Xoá toàn bộ review history ────────────────────────────────────────────────
export async function clearReviewLog() {
  const { error } = await supabase.from('review_log').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
