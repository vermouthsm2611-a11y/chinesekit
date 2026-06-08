// Flashcard loading skeleton — card flip area
export default function FlashcardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-24 bg-gray-100 rounded-lg" />
        <div className="h-8 w-28 bg-gray-100 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-5">
        <div className="h-8 w-52 bg-gray-100 rounded-lg" />
        <div className="h-8 w-64 bg-gray-100 rounded-lg" />
      </div>

      {/* Flashcard */}
      <div className="card h-56 flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-32 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3 mt-5">
        <div className="h-10 w-24 bg-gray-100 rounded-lg" />
        <div className="h-10 w-24 bg-gray-100 rounded-lg" />
        <div className="h-10 w-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}
