import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SentenceList from '@/components/sentences/SentenceList'

async function getSentences() {
  const { data, error } = await supabase
    .from('sentences')
    .select('id, hanzi, pinyin, meaning_vi, notes, created_at')
    .order('created_at', { ascending: false })

  if (error) console.error('getSentences error:', error)
  return data ?? []
}

export default async function SentencesPage() {
  const sentences = await getSentences()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold">Câu</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">
            {sentences.length} câu
          </p>
        </div>
        <Link href="/sentences/new" className="btn btn-primary">
          + Thêm câu mới
        </Link>
      </div>

      <SentenceList sentences={sentences} />
    </div>
  )
}
