import { Suspense } from 'react'
import EntryForm from '@/components/vocab/EntryForm'
import { addEntry } from '@/app/actions/entries'
import Link from 'next/link'

export default function NewVocabPage({ searchParams }) {
  const back = searchParams?.back ?? null

  const backLabel = back?.startsWith('/lyrics')   ? '← Bài hát'
                  : back?.startsWith('/patterns') ? '← Cấu trúc'
                  : '← Thư viện'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={back ?? '/vocab'} className="text-gray-400 hover:text-gray-600 text-sm">
          {backLabel}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-medium text-gray-900">Thêm từ mới</h1>
      </div>

      {/* Suspense required vì EntryForm dùng useSearchParams() */}
      <Suspense fallback={<div className="card max-w-2xl h-40 animate-pulse bg-gray-50" />}>
        <EntryForm action={addEntry} back={back} />
      </Suspense>
    </div>
  )
}
