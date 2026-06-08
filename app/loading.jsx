// Dashboard loading skeleton
// Hiển thị ngay lập tức khi page.jsx đang fetch data — tránh màn hình trắng
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-28 bg-gray-100 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-24 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Stat cards — 4 cols */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
            <div className="h-8 w-10 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Row 1 — 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card h-40" />
        <div className="card h-40" />
      </div>

      {/* Row 2 — 2 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card h-36" />
        <div className="card h-36" />
      </div>
    </div>
  )
}
