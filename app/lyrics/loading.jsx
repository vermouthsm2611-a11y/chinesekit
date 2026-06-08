// Lyrics list loading skeleton — 2-col grid of song cards
export default function LyricsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-16 bg-gray-100 rounded-lg mb-1.5" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-28 bg-gray-100 rounded-lg" />
      </div>

      {/* Song cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card flex items-center gap-4">
            {/* Cover placeholder */}
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-32 bg-gray-100 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
