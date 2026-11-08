'use server'

// Import JSON — file do doubao_vietsub xuất (chinesekit_*.json) hoặc file Export của chính ChineseKit.
// Mỗi mục: { type: 'vocab'|'pattern'|'sentence', hanzi, pinyin?, meaning_vi?, notes?, examples?, hv?, meaning_en? }
// - type 'sentence' -> bảng sentences, còn lại -> entries
// - Bỏ qua: mục sai định dạng, trùng hanzi trong file, hanzi đã có ở entries HOẶC sentences
// - source / created_at trong file bị bỏ qua (DB tự điền mặc định)
import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

const ENTRY_TYPES = ['vocab', 'pattern']
const CHUNK = 100     // .in() đi qua URL của PostgREST -> chia nhỏ để không vượt giới hạn độ dài URL

const str = (v) => (typeof v === 'string' ? v.trim() : '')

async function existingHanzi(table, list) {
  const found = new Set()
  for (let i = 0; i < list.length; i += CHUNK) {
    const { data, error } = await supabase.from(table).select('hanzi').in('hanzi', list.slice(i, i + CHUNK))
    if (error) throw new Error(error.message)
    data?.forEach(r => found.add(r.hanzi))
  }
  return found
}

export async function importEntries(items) {
  if (!Array.isArray(items)) return { error: 'File không đúng định dạng (cần một danh sách JSON).' }

  let invalid = 0, dupInFile = 0
  const seen = new Set()
  const entries = [], sentences = []

  for (const it of items) {
    const hanzi = str(it?.hanzi)
    const type  = str(it?.type) || 'vocab'
    if (!hanzi || ![...ENTRY_TYPES, 'sentence'].includes(type)) { invalid++; continue }
    if (seen.has(hanzi)) { dupInFile++; continue }
    seen.add(hanzi)

    // meaning_vi: '' hợp lệ với NOT NULL (exporter xuất '' khi dịch hỏng) -> sửa sau trong app
    const base = {
      hanzi,
      pinyin:     str(it.pinyin) || null,
      meaning_vi: str(it.meaning_vi),
      notes:      str(it.notes) || null,
    }
    if (type === 'sentence') {
      sentences.push(base)
    } else {
      const examples = Array.isArray(it.examples)
        ? it.examples
            .filter(e => str(e?.hanzi) || str(e?.vi))
            .map(e => ({ hanzi: str(e.hanzi), pinyin: str(e.pinyin), vi: str(e.vi) }))
        : []
      entries.push({ ...base, type, hv: str(it.hv) || null, meaning_en: str(it.meaning_en) || null, examples })
    }
  }

  const skipped = { exists: 0, dupInFile, invalid }
  if (!entries.length && !sentences.length) {
    return { added: { vocab: 0, pattern: 0, sentence: 0 }, skipped }
  }

  // Đã có ở BẤT KỲ bảng nào -> bỏ (tránh 1 hanzi nằm ở cả entries lẫn sentences)
  let exists
  try {
    const list = [...seen]
    const [a, b] = await Promise.all([existingHanzi('entries', list), existingHanzi('sentences', list)])
    exists = new Set([...a, ...b])
  } catch (e) {
    return { error: `Lỗi database: ${e.message}` }
  }
  const newEntries   = entries.filter(e => !exists.has(e.hanzi))
  const newSentences = sentences.filter(s => !exists.has(s.hanzi))
  skipped.exists = entries.length + sentences.length - newEntries.length - newSentences.length

  const added = {
    vocab:    newEntries.filter(e => e.type === 'vocab').length,
    pattern:  newEntries.filter(e => e.type === 'pattern').length,
    sentence: 0,
  }

  if (newEntries.length) {
    const { error } = await supabase.from('entries').insert(newEntries)
    if (error) return { error: `Lỗi thêm từ vựng: ${error.message}` }
  }
  if (newSentences.length) {
    const { error } = await supabase.from('sentences').insert(newSentences)
    // entries đã vào DB rồi -> báo rõ phần đã thêm, không im lặng
    if (error) {
      revalidatePath('/vocab'); revalidatePath('/patterns'); revalidatePath('/')
      return { error: `Đã thêm ${added.vocab + added.pattern} từ/cấu trúc, nhưng lỗi thêm câu: ${error.message}` }
    }
    added.sentence = newSentences.length
  }

  revalidatePath('/vocab')
  revalidatePath('/patterns')
  revalidatePath('/sentences')
  revalidatePath('/')
  return { added, skipped }
}
