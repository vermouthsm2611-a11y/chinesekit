import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function LyricsListPage() {
  const { data: songs } = await supabase
    .from('songs')
    .select('id, title, artist, youtube_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Lyrics</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">
            {songs?.length ?? 0} bài hát
          </p>
        </div>
        <Link href="/lyrics/new" className="btn btn-primary">
          + Thêm bài hát
        </Link>
      </div>

      {!songs || songs.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-[14px] text-gray-400 mb-4">Chưa có bài hát nào.</p>
          <Link href="/lyrics/new" className="btn btn-primary inline-flex">
            + Thêm bài đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/lyrics/${song.id}`}
              className="card hover:shadow-sm transition-shadow flex items-center gap-4 group"
            >
              {/* Cover placeholder */}
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center
                              text-2xl flex-shrink-0 group-hover:bg-red-100 transition-colors">
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-medium text-gray-900 truncate">{song.title}</p>
                {song.artist && (
                  <p className="text-[14px] text-gray-400 mt-0.5">{song.artist}</p>
                )}
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
