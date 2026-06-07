// Helper đọc settings từ Supabase — dùng trong Server Components
import { supabase } from './supabase'

const DEFAULTS = {
  daily_goal:         '20',
  flashcard_count:    '20',
  lyrics_show_pinyin: 'false',
}

export async function getSettings() {
  const { data } = await supabase.from('settings').select('key, value')
  const map = { ...DEFAULTS }
  data?.forEach(({ key, value }) => { map[key] = value })
  return {
    dailyGoal:        parseInt(map.daily_goal,      10) || 20,
    flashcardCount:   parseInt(map.flashcard_count, 10) || 20,
    lyricsShowPinyin: map.lyrics_show_pinyin === 'true',
    raw: map,
  }
}
