'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { clearReviewLog } from '@/app/actions/settings'
import Toast from '@/components/ui/Toast'

export default function SettingsForm({ action, settings }) {
  const [saved,    setSaved]    = useState(false)
  const [toastMsg, setToastMsg] = useState('')

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
      <div className="max-w-2xl flex flex-col gap-6">

        <form action={handleSubmit} className="card flex flex-col gap-6">
          {/* Section: Học tập */}
          <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            📚 Học tập
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Mục tiêu ôn tập hàng ngày
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="daily_goal"
                defaultValue={settings.dailyGoal}
                min={1} max={200}
                className="input w-28 text-center text-[17px]"
              />
              <span className="text-[15px]" style={{ color: 'var(--text-muted)' }}>thẻ / ngày</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Số thẻ mỗi phiên Flashcard
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="flashcard_count"
                defaultValue={settings.flashcardCount}
                min={5} max={100}
                className="input w-28 text-center text-[17px]"
              />
              <span className="text-[15px]" style={{ color: 'var(--text-muted)' }}>thẻ / phiên</span>
            </div>
          </div>

          <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[18px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🎵 Lyrics
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="lyrics_show_pinyin"
                value="true"
                defaultChecked={settings.lyricsShowPinyin}
                className="w-5 h-5 accent-[var(--primary)]"
              />
              <span className="text-[16px]" style={{ color: 'var(--text-secondary)' }}>
                Hiện pinyin mặc định trong Lyrics
              </span>
            </label>
            <p className="text-[14px] mt-1.5 ml-8" style={{ color: 'var(--text-muted)' }}>
              Bật = pinyin luôn hiện khi mở bài hát, không cần nhấn nút toggle.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <SaveButton />
            {saved && (
              <span className="text-[15px]" style={{ color: 'var(--success)' }}>✓ Đã lưu</span>
            )}
          </div>
        </form>

        {/* Export */}
        <div className="card flex flex-col gap-4">
          <p className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            💾 Xuất dữ liệu
          </p>
          <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            Export toàn bộ từ vựng và cấu trúc ra file.
          </p>
          <div className="flex gap-2">
            <a href="/api/export?format=csv" download className="btn">⬇ CSV</a>
            <a href="/api/export?format=json" download className="btn">⬇ JSON</a>
          </div>
        </div>

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

function DangerZone() {
  const [loading, setLoading] = useState(false)

  async function handleClear() {
    if (!confirm('Xoá TOÀN BỘ lịch sử ôn tập? Hành động này không thể hoàn tác.')) return
    setLoading(true)
    try { await clearReviewLog() }
    finally { setLoading(false) }
  }

  return (
    <div className="card" style={{ borderColor: '#FCA5A5' }}>
      <p className="text-[18px] font-semibold mb-1" style={{ color: 'var(--error)' }}>
        ⚠️ Vùng nguy hiểm
      </p>
      <p className="text-[15px] mb-5" style={{ color: 'var(--text-secondary)' }}>
        Các hành động dưới đây không thể hoàn tác.
      </p>
      <button
        type="button"
        onClick={handleClear}
        disabled={loading}
        className="btn disabled:opacity-60"
        style={{ borderColor: '#FCA5A5', color: 'var(--error)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--error-soft)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        {loading ? 'Đang xoá...' : '🗑 Xoá toàn bộ lịch sử ôn tập'}
      </button>
    </div>
  )
}
