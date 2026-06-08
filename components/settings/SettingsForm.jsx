'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { clearReviewLog } from '@/app/actions/settings'
import Toast from '@/components/ui/Toast'

// ── Main form ─────────────────────────────────────────────────────────────────
export default function SettingsForm({ action, settings }) {
  const [saved,     setSaved]     = useState(false)
  const [toastMsg,  setToastMsg]  = useState('')

  // saveSettings giờ có signature (prevState, formData) nhưng SettingsForm
  // gọi trực tiếp — truyền null làm prevState
  async function handleSubmit(formData) {
    const result = await action(null, formData)
    if (result?.error) {
      setToastMsg(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <>
    <Toast message={toastMsg} type="error" onClose={() => setToastMsg('')} />
    <div className="max-w-xl flex flex-col gap-6">

      <form action={handleSubmit} className="card flex flex-col gap-5">
        <p className="text-[14px] font-medium text-gray-800">📚 Học tập</p>

        {/* Daily goal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-gray-600">
            Mục tiêu ôn tập hàng ngày
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="daily_goal"
              defaultValue={settings.dailyGoal}
              min={1} max={200}
              className="input w-24 text-center"
            />
            <span className="text-[13px] text-gray-400">thẻ / ngày</span>
          </div>
        </div>

        {/* Flashcard count per session */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-gray-600">
            Số thẻ mỗi phiên Flashcard
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="flashcard_count"
              defaultValue={settings.flashcardCount}
              min={5} max={100}
              className="input w-24 text-center"
            />
            <span className="text-[13px] text-gray-400">thẻ / phiên</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-[14px] font-medium text-gray-800 mb-4">🎵 Lyrics</p>

          {/* Lyrics show pinyin by default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="lyrics_show_pinyin"
              value="true"
              defaultChecked={settings.lyricsShowPinyin}
              className="w-4 h-4 accent-[#E24B4A]"
            />
            <span className="text-[13px] text-gray-700">Hiện pinyin mặc định trong Lyrics</span>
          </label>
          <p className="text-[11px] text-gray-400 mt-1 ml-7">
            Bật = pinyin luôn hiện khi mở bài hát, không cần nhấn nút toggle.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <SaveButton />
          {saved && <span className="text-[12px] text-green-600">✓ Đã lưu</span>}
        </div>
      </form>

      {/* Export */}
      <div className="card flex flex-col gap-4">
        <p className="text-[14px] font-medium text-gray-800">💾 Xuất dữ liệu</p>
        <p className="text-[13px] text-gray-500">
          Export toàn bộ từ vựng và cấu trúc ra file.
        </p>
        <div className="flex gap-2">
          <a
            href="/api/export?format=csv"
            download
            className="btn"
          >
            ⬇ CSV
          </a>
          <a
            href="/api/export?format=json"
            download
            className="btn"
          >
            ⬇ JSON
          </a>
        </div>
      </div>

      {/* Danger zone */}
      <DangerZone />
    </div>
    </>
  )
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? 'Đang lưu...' : '💾 Lưu cài đặt'}
    </button>
  )
}

// ── Danger zone — tách riêng để confirm không ảnh hưởng form chính ─────────
function DangerZone() {
  const [loading, setLoading] = useState(false)

  async function handleClear() {
    if (!confirm('Xoá TOÀN BỘ lịch sử ôn tập? Hành động này không thể hoàn tác.')) return
    setLoading(true)
    try { await clearReviewLog() }
    finally { setLoading(false) }
  }

  return (
    <div className="card border-red-100">
      <p className="text-[14px] font-medium text-red-600 mb-1">⚠️ Vùng nguy hiểm</p>
      <p className="text-[13px] text-gray-500 mb-4">
        Các hành động dưới đây không thể hoàn tác.
      </p>
      <button
        type="button"
        onClick={handleClear}
        disabled={loading}
        className="btn border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? 'Đang xoá...' : '🗑 Xoá toàn bộ lịch sử ôn tập'}
      </button>
    </div>
  )
}
