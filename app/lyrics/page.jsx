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
          <h1 className="text-[30px] font-semibold">Lyrics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
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
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Chưa có bài hát nào.</p>
          <Link href="/lyrics/new" className="btn btn-primary inline-flex">
            + Thêm bài đầu tiên
          </Link>
        </div>
      ) : (
        /* auto-fill: cột tự điều chỉnh theo số bài, không để ô trống kỳ lạ */
        <div className="grid gap-4"
             style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/lyrics/${song.id}`}
              className="card card-interactive flex items-center gap-4 group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center
                              text-2xl flex-shrink-0"
                   style={{ background: 'var(--primary-soft)' }}
              >
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {song.title}
                </p>
                {song.artist && (
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {song.artist}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 transition-colors"
                    style={{ color: 'var(--border-strong)' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
