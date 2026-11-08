'use client'

// Kho thông báo kết quả import ở CẤP MODULE (không nằm trong state của component).
// Lý do: importEntries() gọi revalidatePath -> Next.js làm mới /settings trong cùng response,
// ImportCard có thể bị dựng lại -> state cục bộ (thông báo) mất trước khi kịp hiện.
// Module JS không bị dựng lại -> component cũ hay mới đều đọc được thông báo qua useSyncExternalStore.
const EMPTY = { message: '', type: 'success' }
let state = EMPTY
const listeners = new Set()

export function setImportToast(next) {
  state = next
  listeners.forEach(l => l())
}

export function clearImportToast() {
  setImportToast(EMPTY)
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getSnapshot = () => state
export const getServerSnapshot = () => EMPTY   // server không bao giờ có thông báo
