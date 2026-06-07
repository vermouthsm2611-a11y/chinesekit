'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Thêm bài hát + lyrics ────────────────────────────────────────────────────
// lyricsRaw   — lyrics tiếng Trung, mỗi dòng 1 câu
// vietsubRaw  — vietsub, số dòng phải khớp với lyricsRaw
export async function addSong(formData) {
  const title      = formData.get('title')?.trim()
  const artist     = formData.get('artist')?.trim()    || null
  const youtubeUrl = formData.get('youtube_url')?.trim() || null
  const lyricsRaw  = formData.get('lyrics')?.trim()    || ''
  const vietsubRaw = formData.get('vietsub')?.trim()   || ''

  if (!title) throw new Error('Thiếu tên bài hát')

  // Parse: split theo newline, bỏ dòng trắng
  const hanziLines  = lyricsRaw.split('\n').map(l => l.trim()).filter(Boolean)
  const vietLines   = vietsubRaw.split('\n').map(l => l.trim())

  // Insert song trước để lấy id
  const { data: song, error: songErr } = await supabase
    .from('songs')
    .insert({ title, artist, youtube_url: youtubeUrl })
    .select('id')
    .single()

  if (songErr) throw new Error(songErr.message)

  // Insert từng dòng lyrics
  if (hanziLines.length > 0) {
    const lines = hanziLines.map((hanzi, i) => ({
      song_id:    song.id,
      line_order: i,
      hanzi,
      vietsub: vietLines[i] ?? null,   // null nếu vietsub ít dòng hơn
    }))

    const { error: lineErr } = await supabase.from('song_lines').insert(lines)
    if (lineErr) throw new Error(lineErr.message)
  }

  revalidatePath('/', 'layout')
  redirect(`/lyrics/${song.id}`)
}

// ── Cập nhật bài hát + vietsub ───────────────────────────────────────────────
// Chỉ update metadata + vietsub — hanzi giữ nguyên, không cho sửa để tránh lệch dòng
export async function updateSong(id, formData) {
  const title      = formData.get('title')?.trim()
  const artist     = formData.get('artist')?.trim()      || null
  const youtubeUrl = formData.get('youtube_url')?.trim() || null
  const vietsubRaw = formData.get('vietsub')?.trim()     || ''

  if (!title) throw new Error('Thiếu tên bài hát')

  // Update song metadata
  const { error: songErr } = await supabase
    .from('songs')
    .update({ title, artist, youtube_url: youtubeUrl })
    .eq('id', id)

  if (songErr) throw new Error(songErr.message)

  // Lấy danh sách line_id theo thứ tự để map vietsub
  const { data: lines, error: fetchErr } = await supabase
    .from('song_lines')
    .select('id, line_order')
    .eq('song_id', id)
    .order('line_order')

  if (fetchErr) throw new Error(fetchErr.message)

  // Parse vietsub mới — giữ dòng trắng để mapping đúng vị trí
  const vietLines = vietsubRaw.split('\n').map(l => l.trim())

  // Upsert từng dòng (chỉ update vietsub)
  if (lines?.length) {
    const updates = lines.map((line, i) => ({
      id:      line.id,
      song_id: id,              // required for upsert
      line_order: line.line_order,
      vietsub: vietLines[i] ?? null,
    }))

    const { error: updateErr } = await supabase
      .from('song_lines')
      .upsert(updates, { onConflict: 'id' })

    if (updateErr) throw new Error(updateErr.message)
  }

  revalidatePath(`/lyrics/${id}`)
  revalidatePath('/lyrics')
  redirect(`/lyrics/${id}`)
}

// ── Xoá bài hát (song_lines tự xoá cascade) ─────────────────────────────────
export async function deleteSong(id) {
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  redirect('/lyrics')
}
