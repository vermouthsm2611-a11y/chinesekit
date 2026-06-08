// Không dùng force-dynamic — targeted revalidation từ actions đủ để keep data fresh
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PatternList from '@/components/patterns/PatternList'

export default async function PatternsPage() {
  const { data: patterns } = await supabase
    .from('entries')
    .select('id, hanzi, pinyin, hv, meaning_vi, example, example_vi, examples, notes, source')
    .eq('type', 'pattern')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Cấu trúc</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {patterns?.length ?? 0} patterns
          </p>
        </div>
        <Link
          href="/vocab/new?type=pattern"
          className="btn btn-primary"
        >
          + Thêm cấu trúc
        </Link>
      </div>

      <PatternList patterns={patterns ?? []} />
    </div>
  )
}
