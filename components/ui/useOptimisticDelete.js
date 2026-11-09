'use client'

// Ẩn dòng NGAY khi bấm xoá, rồi mới gọi server action. Lỗi -> hiện lại dòng + trả lỗi để hiện Toast.
// Thành công: action gọi revalidatePath -> danh sách nhận props mới (không còn mục đó).
import { useState, useCallback } from 'react'

export default function useOptimisticDelete(action) {
  const [removed, setRemoved] = useState(() => new Set())
  const [error,   setError]   = useState('')

  const remove = useCallback(async (id) => {
    setRemoved(prev => new Set(prev).add(id))
    let r
    try {
      r = await action(id)
    } catch (e) {
      r = { error: e.message }
    }
    if (r?.error) {
      setRemoved(prev => { const s = new Set(prev); s.delete(id); return s })
      setError(`Xoá lỗi: ${r.error}`)
    }
  }, [action])

  return { removed, remove, error, clearError: () => setError('') }
}
