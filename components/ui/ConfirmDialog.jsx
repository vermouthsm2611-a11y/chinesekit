'use client'

// ConfirmDialog — popup xác nhận thay cho confirm() của trình duyệt
// Usage: <ConfirmDialog open title="Xoá?" message={<>...</>} confirmLabel="Xoá"
//          onConfirm={() => {}} onCancel={() => {}} />
// - Render qua portal vào <body>: dùng được cả khi nút mở nằm trong <a>/<button>/<table>
// - Esc hoặc click nền = Huỷ; focus mặc định vào "Huỷ" (Enter không xoá nhầm)
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Xoá', cancelLabel = 'Huỷ', onConfirm, onCancel,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.45)' }}
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="card w-full max-w-sm flex flex-col gap-4"
        style={{ boxShadow: 'var(--shadow-md)' }}
        onClick={(e) => e.stopPropagation()}   // click trong hộp không đóng
      >
        <p id="confirm-title" className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        {message && (
          <div className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{message}</div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button ref={cancelRef} type="button" className="btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--error)', borderColor: 'var(--error)', color: '#fff' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
