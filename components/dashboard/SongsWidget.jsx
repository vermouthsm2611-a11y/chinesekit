import Link from 'next/link'

// Props: songs — array { id, title, artist }
export default function SongsWidget({ songs }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-gray-800">🎵 Bài hát đang học</p>
        <Link href="/lyrics" className="text-[12px] text-gray-400 hover:text-gray-600">
          Thêm bài →
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/lyrics/${song.id}`}
            className="flex items-center gap-3 py-2.5 hover:opacity-75 transition-opacity"
          >
            {/* Cover placeholder */}
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center
                            text-base flex-shrink-0">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-800 truncate">{song.title}</p>
              {song.artist && (
                <p className="text-[11px] text-gray-400">{song.artist}</p>
              )}
            </div>
          </Link>
        ))}

        {/* Add new — luôn hiện ở cuối */}
        <Link
          href="/lyrics/new"
          className="flex items-center gap-3 py-2.5 opacity-40 hover:opacity-70 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
            ＋
          </div>
          <p className="text-[13px] text-gray-500">Paste lyrics mới...</p>
        </Link>
      </div>
    </div>
  )
}
