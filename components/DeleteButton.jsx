'use client'

// DeleteButton — nút "🗑 Xoá" trong trang Sửa (vocab / câu / lyrics), xác nhận bằng ConfirmDialog
// Props:
//   action      — Server Action (đã bind id), tự redirect sau khi xoá
//   label       — tên item để hiện trong popup (ví dụ: "后悔")
//   confirmText — tuỳ chỉnh nội dung popup (optional)
import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function DeleteButton({ action, label, confirmText }) {
  const [open,     setOpen]     = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setOpen(false)
    setDeleting(true)
    try {
      await action()            // action redirect -> trang tự chuyển
    } catch (e) {
      // redirect() của Next không đi vào đây; chỉ lỗi thật (action throw) mới tới
      setDeleting(false)
      throw e
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={deleting}
        className="btn text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-60"
        onClick={() => setOpen(true)}
      >
        {deleting ? 'Đang xoá...' : '🗑 Xoá'}
      </button>
      <ConfirmDialog
        open={open}
        title="Xoá mục này?"
        message={confirmText ?? <>Xoá <span className="hanzi text-[18px]" style={{ color: 'var(--text-primary)' }}>{label}</span>? Không thể hoàn tác.</>}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
