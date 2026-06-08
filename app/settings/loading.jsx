// Settings loading skeleton
export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-20 bg-gray-100 rounded-lg mb-6" />

      <div className="card flex flex-col gap-6">
        {/* 3 setting fields */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
            <div className="h-9 w-full bg-gray-100 rounded-lg" />
          </div>
        ))}

        {/* Save button */}
        <div className="h-9 w-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}
