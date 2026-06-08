'use client'

// Toast — hiện thông báo lỗi/thành công góc trên phải
// Usage: <Toast message="..." type="error|success" />
// Tự động ẩn sau 4s, có nút × đóng thủ công

import { useEffect, useState } from 'react'

const STYLES = {
  error:   'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  warn:    'bg-yellow-50 border-yellow-200 text-yellow-700',
}

const ICONS = { error: '✕', success: '✓', warn: '!' }

export default function Toast({ message, type = 'error', onClose }) {
  const [visible, setVisible] = useState(false)

  // Animate in khi mount
  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => handleClose(), 4000)
    return () => clearTimeout(t)
  }, [message])

  function handleClose() {
    setVisible(false)
    // Đợi animation out xong rồi mới unmount
    setTimeout(() => onClose?.(), 300)
  }

  if (!message) return null

  return (
    <div
      role="alert"
      className={`
        fixed top-4 right-4 z-50 flex items-start gap-2.5
        border rounded-xl px-4 py-3 shadow-sm max-w-sm text-[13px] font-medium
        transition-all duration-300
        ${STYLES[type] ?? STYLES.error}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {/* Icon */}
      <span className="flex-shrink-0 w-4 h-4 rounded-full border border-current
                       flex items-center justify-center text-[10px] font-bold mt-0.5">
        {ICONS[type]}
      </span>

      {/* Message */}
      <span className="flex-1 leading-snug">{message}</span>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1 leading-none"
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  )
}
