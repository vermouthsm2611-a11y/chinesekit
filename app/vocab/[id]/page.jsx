import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import EntryForm from '@/components/vocab/EntryForm'
import { updateEntry, deleteEntry } from '@/app/actions/entries'
import DeleteButton from '@/components/DeleteButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Dynamic route: /vocab/[id]
export default async function EditVocabPage({ params, searchParams }) {
  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!entry) notFound()

  // back: trang trước đó (lyrics, patterns...) — dùng để redirect sau save
  const back = searchParams?.back ?? null

  const updateWithId = updateEntry.bind(null, entry.id)
  const deleteWithId = deleteEntry.bind(null, entry.id)

  // Label breadcrumb theo back URL
  const backLabel = back?.startsWith('/lyrics')   ? '← Lyrics'
                  : back?.startsWith('/patterns') ? '← Cấu trúc'
                  : '← Thư viện'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={back ?? '/vocab'} className="text-gray-400 hover:text-gray-600 text-sm">
            {backLabel}
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-medium text-gray-900">
            Sửa — <span className="hanzi">{entry.hanzi}</span>
          </h1>
        </div>

        <DeleteButton action={deleteWithId} label={entry.hanzi} />
      </div>

      <Suspense fallback={<div className="card max-w-2xl h-40 animate-pulse bg-gray-50" />}>
        <EntryForm action={updateWithId} initial={entry} back={back} />
      </Suspense>
    </div>
  )
}
