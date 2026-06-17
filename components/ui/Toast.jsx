'use client'

// Toast — hiện thông báo lỗi/thành công góc trên phải
// Usage: <Toast message="..." type="error|success|warn" onClose={() => {}} />
// Tự động ẩn sau 4s, có nút × đóng thủ công

import { useEffect, useState } from 'react'

// Semantic colors — giữ nguyên error/success/warn không dùng brand accent
// để tránh nhầm lẫn với UI actions
const STYLES = {
  error:   { bg: 'var(--error-soft)',   border: '#FCA5A5', color: 'var(--error)' },
  success: { bg: 'var(--success-soft)', border: '#6EE7B7', color: 'var(--success)' },
  warn:    { bg: 'var(--warning-soft)', border: '#FCD34D', color: 'var(--warning)' },
}

const ICONS = { error: '✕', success: '✓', warn: '!' }

export default function Toast({ message, type = 'error', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => handleClose(), 4000)
    return () => clearTimeout(t)
  }, [message])

  function handleClose() {
    setVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  if (!message) return null

  const s = STYLES[type] ?? STYLES.error

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-50 flex items-start gap-2.5
                 px-4 py-3 max-w-sm text-[13px] font-medium
                 transition-all duration-300"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        color: s.color,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      {/* Icon circle */}
      <span
        className="flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center
                   text-[13px] font-bold mt-0.5"
        style={{ borderColor: 'currentColor' }}
      >
        {ICONS[type]}
      </span>

      {/* Message */}
      <span className="flex-1 leading-snug">{message}</span>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 ml-1 leading-none transition-opacity opacity-50 hover:opacity-100"
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  )
}
