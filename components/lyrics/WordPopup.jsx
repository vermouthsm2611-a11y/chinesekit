'use client'

import PinyinText from '@/components/ui/PinyinText'

// WordPopup — hiện khi click vào 1 ký tự/từ trong lyrics
// Props:
//   char    — ký tự/từ đang xem
//   entries — kết quả tra từ DB (array, có thể rỗng)
//   pos     — { x, y } tọa độ click để định vị popup
//   onClose — callback đóng popup
export default function WordPopup({ char, entries, pos, onClose }) {
  if (!char) return null

  // Tính vị trí popup: tránh bị out-of-viewport
  const style = {
    position: 'fixed',
    top:  pos.y + 16,
    left: Math.min(pos.x, window.innerWidth - 300),
    zIndex: 50,
    width: 290,
  }

  return (
    <>
      {/* Backdrop transparent để click ra ngoài đóng popup */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div style={style} className="card shadow-lg border border-gray-200 z-50 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-3xl font-medium">{char}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        {/* Kết quả */}
        <div className="max-h-64 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-[13px] text-gray-400">Chưa có trong thư viện</p>
              <a
                href={`/vocab/new?hanzi=${encodeURIComponent(char)}&back=${encodeURIComponent(window.location.pathname)}`}
                className="btn btn-primary mt-3 text-[12px] w-full justify-center"
              >
                + Thêm từ này
              </a>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {entry.pinyin && (
                    <PinyinText pinyin={entry.pinyin} className="text-[15px]" />
                  )}
                  {entry.hv && (
                    <span className="text-[13px] text-gray-300">· {entry.hv}</span>
                  )}
                  <span className={`badge ml-auto text-[10px] ${
                    entry.type === 'vocab' ? 'badge-vocab' : 'badge-pattern'
                  }`}>
                    {entry.type === 'vocab' ? 'từ vựng' : 'cấu trúc'}
                  </span>
                </div>
                <p className="text-[16px] font-medium text-gray-800">{entry.meaning_vi}</p>
                {entry.example && (
                  <p className="text-[13px] text-gray-400 mt-1 italic">{entry.example}</p>
                )}
                {/* Sửa → trả về đúng trang hiện tại sau save */}
                <div className="flex justify-end mt-2">
                  <a
                    href={`/vocab/${entry.id}?back=${encodeURIComponent(window.location.pathname)}`}
                    className="text-[11px] text-gray-400 hover:text-[#E24B4A] transition-colors"
                  >
                    ✏️ Sửa →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
