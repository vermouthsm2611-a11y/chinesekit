// Không dùng force-dynamic — targeted revalidation từ actions đủ để keep data fresh
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import VocabList from '@/components/vocab/VocabList'

// Chỉ fetch vocab — patterns có trang riêng (/patterns)
// Thêm examples để hiện preview ví dụ đầu tiên trong list
async function getEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('id, hanzi, pinyin, hv, meaning_vi, source, created_at, examples, notes')
    .eq('type', 'vocab')
    .order('created_at', { ascending: false })

  if (error) console.error('getEntries error:', error)
  return data ?? []
}

export default async function VocabPage() {
  const entries = await getEntries()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Từ vựng</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">
            {entries.length} từ vựng
          </p>
        </div>
        <Link href="/vocab/new" className="btn btn-primary">
          + Thêm từ mới
        </Link>
      </div>

      <VocabList entries={entries} />
    </div>
  )
}
