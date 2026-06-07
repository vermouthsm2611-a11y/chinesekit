export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import VocabList from '@/components/vocab/VocabList'

// Fetch toàn bộ entries một lần — VocabList filter client-side
async function getEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('id, type, hanzi, pinyin, meaning_vi, source, created_at')
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
          <h1 className="text-xl font-medium text-gray-900">Thư viện</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {entries.length} entries tổng cộng
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
