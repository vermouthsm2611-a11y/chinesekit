// Stats loading skeleton
export default function StatsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-24 bg-gray-100 rounded-lg mb-6" />

      {/* Row 1: 4 stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
            <div className="h-8 w-10 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Row 2: Streak cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card h-20" />
        <div className="card h-20" />
      </div>

      {/* Row 3: Activity chart */}
      <div className="card h-32 mb-5" />

      {/* Row 4: Results + Source */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card h-48" />
        <div className="card h-48" />
      </div>

      {/* Row 5: Top reviewed */}
      <div className="card h-40" />
    </div>
  )
}
