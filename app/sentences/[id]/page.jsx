import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import SentenceForm from '@/components/sentences/SentenceForm'
import DeleteButton from '@/components/DeleteButton'
import { updateSentence, deleteSentence } from '@/app/actions/sentences'

export default async function EditSentencePage({ params }) {
  const { data: sentence } = await supabase
    .from('sentences')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!sentence) notFound()

  const updateWithId = updateSentence.bind(null, sentence.id)
  const deleteWithId = deleteSentence.bind(null, sentence.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/sentences" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Câu
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-[30px] font-semibold">
            Sửa — <span className="hanzi">{sentence.hanzi.slice(0, 12)}{sentence.hanzi.length > 12 ? '…' : ''}</span>
          </h1>
        </div>
        <DeleteButton action={deleteWithId} label={sentence.hanzi.slice(0, 20)} />
      </div>

      <Suspense fallback={<div className="card max-w-2xl h-60 animate-pulse bg-gray-50" />}>
        <SentenceForm action={updateWithId} initial={sentence} />
      </Suspense>
    </div>
  )
}
