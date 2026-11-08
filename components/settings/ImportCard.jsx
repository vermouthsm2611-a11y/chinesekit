'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { importEntries } from '@/app/actions/import'
import Toast from '@/components/ui/Toast'
import {
  setImportToast, clearImportToast, subscribe, getSnapshot, getServerSnapshot,
} from '@/components/settings/importToastStore'

export default function ImportCard() {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  // Thông báo đọc từ kho cấp module -> sống sót khi trang làm mới sau import (xem importToastStore.js)
  const toast = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''                      // chọn lại cùng file vẫn kích hoạt onChange
    if (!file) return

    let items
    try {
      items = JSON.parse(await file.text())
    } catch {
      setImportToast({ message: 'File không phải JSON hợp lệ.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const r = await importEntries(items)
      if (r?.error) {
        setImportToast({ message: r.error, type: 'error' })
        return
      }
      const { added, skipped } = r
      const parts = [`${added.vocab} từ`, `${added.sentence} câu`]
      if (added.pattern) parts.push(`${added.pattern} cấu trúc`)
      const skip = skipped.exists + skipped.dupInFile + skipped.invalid
      const msg = `Đã thêm ${parts.join(' · ')}`
        + (skip ? ` · bỏ qua ${skip} (đã có ${skipped.exists}, trùng ${skipped.dupInFile}, lỗi ${skipped.invalid})` : '')
      setImportToast({ message: msg, type: 'success' })
    } catch (err) {
      setImportToast({ message: `Import lỗi: ${err.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col gap-4">
      <Toast message={toast.message} type={toast.type} onClose={clearImportToast} />
      <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        📥 Nhập dữ liệu
      </p>
      <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
        Import file JSON (từ doubao_vietsub hoặc file Export). Mục đã có (trùng hanzi) sẽ được bỏ qua.
      </p>
      <div>
        <input ref={inputRef} type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />
        <button type="button" className="btn disabled:opacity-60" disabled={loading}
                onClick={() => inputRef.current?.click()}>
          {loading ? 'Đang import...' : '⬆ Import JSON'}
        </button>
      </div>
    </div>
  )
}
