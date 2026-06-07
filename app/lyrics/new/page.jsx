import { addSong } from '@/app/actions/songs'
import Link from 'next/link'
import AddSongForm from '@/components/lyrics/AddSongForm'

export default function NewLyricsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/lyrics" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Bài hát
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-medium text-gray-900">Thêm bài hát mới</h1>
      </div>

      <AddSongForm action={addSong} />
    </div>
  )
}
