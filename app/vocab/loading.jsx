// Vocab list loading skeleton
export default function VocabLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-gray-100 rounded-lg mb-1.5" />
          <div className="h-3 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-28 bg-gray-100 rounded-lg" />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="h-9 flex-1 bg-gray-100 rounded-lg" />
        <div className="h-9 w-28 bg-gray-100 rounded-lg" />
        <div className="h-9 w-28 bg-gray-100 rounded-lg" />
      </div>

      {/* Table rows */}
      <div className="card p-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="h-5 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded flex-1" />
            <div className="h-5 w-14 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
