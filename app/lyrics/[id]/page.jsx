import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'
import { notFound } from 'next/navigation'
import { deleteSong } from '@/app/actions/songs'
import LyricsViewer from '@/components/lyrics/LyricsViewer'
import DeleteButton from '@/components/DeleteButton'
import Link from 'next/link'

export default async function LyricsPage({ params }) {
  // Fetch song + tất cả lines theo thứ tự
  const [{ data: song }, { data: lines }, { lyricsShowPinyin }] = await Promise.all([
    supabase.from('songs').select('*').eq('id', params.id).single(),
    supabase.from('song_lines')
      .select('id, line_order, hanzi, vietsub')
      .eq('song_id', params.id)
      .order('line_order'),
    getSettings(),
  ])

  if (!song) notFound()

  const deleteWithId = deleteSong.bind(null, song.id)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/lyrics" className="text-gray-400 hover:text-gray-600 text-sm">
              ← Bài hát
            </Link>
          </div>
          <h1 className="text-2xl font-medium text-gray-900">{song.title}</h1>
          {song.artist && (
            <p className="text-[14px] text-gray-400 mt-0.5">{song.artist}</p>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {song.youtube_url && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              ▶ YouTube
            </a>
          )}
          <Link href={`/lyrics/${song.id}/edit`} className="btn">
            ✏️ Sửa
          </Link>
          <DeleteButton action={deleteWithId} label={song.title} />
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6 text-[13px] text-amber-700">
        💡 Nhấn vào bất kỳ ký tự nào để tra nghĩa. Từ chưa có trong thư viện thì thêm ngay từ popup.
      </div>

      {/* Lyrics */}
      {lines && lines.length > 0 ? (
        <div className="card">
          <LyricsViewer lines={lines} initialShowPinyin={lyricsShowPinyin} />
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-400 text-sm">
          Bài hát này chưa có lyrics.
        </div>
      )}
    </div>
  )
}
