import { Suspense } from 'react'
import Link from 'next/link'
import SentenceForm from '@/components/sentences/SentenceForm'
import { addSentence } from '@/app/actions/sentences'

export default function NewSentencePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sentences" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Câu
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-[30px] font-semibold">Thêm câu mới</h1>
      </div>

      <Suspense fallback={<div className="card max-w-2xl h-60 animate-pulse bg-gray-50" />}>
        <SentenceForm action={addSentence} />
      </Suspense>
    </div>
  )
}
