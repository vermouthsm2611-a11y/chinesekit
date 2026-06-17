'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSentence(prevState, formData) {
  const hanzi      = formData.get('hanzi')?.trim()
  const pinyin     = formData.get('pinyin')?.trim()     || null
  const meaning_vi = formData.get('meaning_vi')?.trim()
  const notes      = formData.get('notes')?.trim()      || null

  if (!hanzi)      return { error: 'Câu không được để trống.' }
  if (!meaning_vi) return { error: 'Nghĩa không được để trống.' }

  const { error } = await supabase.from('sentences').insert({ hanzi, pinyin, meaning_vi, notes })
  if (error) return { error: error.message }

  revalidatePath('/sentences')
  redirect('/sentences')
}

export async function updateSentence(id, prevState, formData) {
  const hanzi      = formData.get('hanzi')?.trim()
  const pinyin     = formData.get('pinyin')?.trim()     || null
  const meaning_vi = formData.get('meaning_vi')?.trim()
  const notes      = formData.get('notes')?.trim()      || null

  if (!hanzi)      return { error: 'Câu không được để trống.' }
  if (!meaning_vi) return { error: 'Nghĩa không được để trống.' }

  const { error } = await supabase.from('sentences').update({ hanzi, pinyin, meaning_vi, notes }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/sentences')
  redirect('/sentences')
}

export async function deleteSentence(id) {
  await supabase.from('sentences').delete().eq('id', id)
  revalidatePath('/sentences')
  redirect('/sentences')
}
