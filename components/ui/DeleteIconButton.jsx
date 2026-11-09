'use client'

// DeleteIconButton — nút 🗑 nhỏ dùng trong danh sách (Từ vựng / Cấu trúc / Câu)
// Bấm -> ConfirmDialog -> xác nhận -> onDelete() (danh sách tự ẩn dòng ngay, gọi server sau)
import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function DeleteIconButton({ label, onDelete, className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label={`Xoá ${label}`}
        title="Xoá"
        className={`inline-flex items-center justify-center rounded-md transition-colors
                    text-gray-300 hover:text-red-500 hover:bg-red-50 ${className}`}
        onClick={(e) => {
          // nút có thể nằm cạnh/ trong vùng click của dòng -> không cho sự kiện lan ra
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
        </svg>
      </button>

      <ConfirmDialog
        open={open}
        title="Xoá mục này?"
        message={<>Xoá <span className="hanzi text-[18px]" style={{ color: 'var(--text-primary)' }}>{label}</span>? Không thể hoàn tác.</>}
        onCancel={() => setOpen(false)}
        onConfirm={() => { setOpen(false); onDelete() }}
      />
    </>
  )
}
