import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { updateSong } from '@/app/actions/songs'
import EditSongForm from '@/components/lyrics/EditSongForm'
import Link from 'next/link'

export default async function EditLyricsPage({ params }) {
  const [{ data: song }, { data: lines }] = await Promise.all([
    supabase.from('songs').select('*').eq('id', params.id).single(),
    supabase.from('song_lines')
      .select('id, line_order, hanzi, vietsub')
      .eq('song_id', params.id)
      .order('line_order'),
  ])

  if (!song) notFound()

  const updateWithId = updateSong.bind(null, song.id)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/lyrics/${song.id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← {song.title}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-medium text-gray-900">Chỉnh sửa</h1>
      </div>

      <EditSongForm song={song} lines={lines ?? []} action={updateWithId} />
    </div>
  )
}
