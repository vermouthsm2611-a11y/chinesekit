'use server'

// Server Actions — chạy trên server, gọi trực tiếp từ form
// Không cần tạo API route riêng cho CRUD cơ bản
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Thêm entry mới ───────────────────────────────────────────────────────────
// Nhận FormData từ <form action={addEntry}>
function parseExamples(formData) {
  try {
    const raw = formData.get('examples')
    const arr = raw ? JSON.parse(raw) : []
    // Lọc bỏ item rỗng hoàn toàn
    return arr.filter(e => e.hanzi?.trim() || e.vi?.trim())
  } catch { return [] }
}

// entries → sentences: bảng sentences chỉ có hanzi / pinyin / meaning_vi / notes
function toSentence({ hanzi, pinyin, meaning_vi, notes }) {
  return { hanzi, pinyin, meaning_vi, notes }
}

export async function addEntry(prevState, formData) {
  const payload = {
    type:       formData.get('type')       || 'vocab',
    hanzi:      formData.get('hanzi')?.trim(),
    pinyin:     formData.get('pinyin')?.trim()     || null,
    hv:         formData.get('hv')?.trim()         || null,
    meaning_vi: formData.get('meaning_vi')?.trim(),
    meaning_en: formData.get('meaning_en')?.trim() || null,
    notes:      formData.get('notes')?.trim()      || null,
    source:     formData.get('source')             || 'manual',
    examples:   parseExamples(formData),
  }

  // Validate — trả về error thay vì throw để client hiện toast thay vì error overlay
  if (!payload.hanzi)      return { error: 'Hanzi là bắt buộc.' }
  if (!payload.meaning_vi) return { error: 'Nghĩa tiếng Việt là bắt buộc.' }

  // Loại "Câu" không thuộc entries — lưu thẳng vào bảng sentences
  if (payload.type === 'sentence') {
    const { error } = await supabase.from('sentences').insert(toSentence(payload))
    if (error) return { error: `Lỗi database: ${error.message}` }

    revalidatePath('/sentences')
    redirect('/sentences')
  }

  const { error } = await supabase.from('entries').insert(payload)
  if (error) return { error: `Lỗi database: ${error.message}` }

  revalidatePath('/vocab')
  revalidatePath('/patterns')
  revalidatePath('/')

  const back = formData.get('back')
  redirect(back && back.startsWith('/') ? back : '/vocab')
}

// ── Cập nhật entry ───────────────────────────────────────────────────────────
export async function updateEntry(id, prevState, formData) {
  const payload = {
    type:       formData.get('type'),
    hanzi:      formData.get('hanzi')?.trim(),
    pinyin:     formData.get('pinyin')?.trim()     || null,
    hv:         formData.get('hv')?.trim()         || null,
    meaning_vi: formData.get('meaning_vi')?.trim(),
    meaning_en: formData.get('meaning_en')?.trim() || null,
    notes:      formData.get('notes')?.trim()      || null,
    source:     formData.get('source'),
    examples:   parseExamples(formData),
  }

  if (!payload.hanzi)      return { error: 'Hanzi là bắt buộc.' }
  if (!payload.meaning_vi) return { error: 'Nghĩa tiếng Việt là bắt buộc.' }

  // Đổi loại sang "Câu" → move sang bảng sentences rồi xoá khỏi entries.
  // Insert trước, delete sau: nếu lỗi giữa chừng thì dư bản ghi, không mất data.
  if (payload.type === 'sentence') {
    const { error: insertErr } = await supabase.from('sentences').insert(toSentence(payload))
    if (insertErr) return { error: `Lỗi database: ${insertErr.message}` }

    const { error: deleteErr } = await supabase.from('entries').delete().eq('id', id)
    if (deleteErr) return { error: `Đã tạo câu nhưng không xoá được entry cũ: ${deleteErr.message}` }

    revalidatePath('/sentences')
    revalidatePath('/vocab')
    revalidatePath('/patterns')
    revalidatePath('/')
    redirect('/sentences')
  }

  const { error } = await supabase.from('entries').update(payload).eq('id', id)
  if (error) return { error: `Lỗi database: ${error.message}` }

  // Targeted revalidation — bao gồm cả dynamic segment /vocab/[id]
  revalidatePath('/vocab')
  revalidatePath(`/vocab/${id}`)
  revalidatePath('/patterns')
  revalidatePath('/')           // dashboard: recent entries

  // Trả về đúng trang trước đó (lyrics, patterns, ...) nếu có
  const back = formData.get('back')
  redirect(back && back.startsWith('/') ? back : '/vocab')
}

// ── Xoá entry ────────────────────────────────────────────────────────────────
export async function deleteEntry(id) {
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/vocab')
  revalidatePath('/patterns')
  revalidatePath('/')           // dashboard: stat count + recent entries
  redirect('/vocab')
}
