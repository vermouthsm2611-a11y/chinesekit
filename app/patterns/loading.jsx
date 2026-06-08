// Patterns loading skeleton — accordion cards
export default function PatternsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 bg-gray-100 rounded-lg mb-1.5" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-32 bg-gray-100 rounded-lg" />
      </div>

      {/* Accordion cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-4 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
