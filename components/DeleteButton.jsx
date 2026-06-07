'use client'

// DeleteButton — Client Component xử lý confirm dialog trước khi submit
// Dùng được cho cả vocab và lyrics
// Props:
//   action      — Server Action (đã bind id)
//   label       — tên item để hiện trong confirm (ví dụ: "后悔")
//   confirmText — tuỳ chỉnh message confirm (optional)
export default function DeleteButton({ action, label, confirmText }) {
  const message = confirmText ?? `Xoá "${label}"?`

  return (
    <form action={action}>
      <button
        type="submit"
        className="btn text-red-500 border-red-200 hover:bg-red-50"
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault()
        }}
      >
        🗑 Xoá
      </button>
    </form>
  )
}
