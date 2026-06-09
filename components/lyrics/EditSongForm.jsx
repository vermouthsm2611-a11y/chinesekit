'use client'

// EditSongForm — sửa metadata + vietsub của bài hát
// Hanzi giữ nguyên (hiển thị read-only để tham chiếu)
// Vietsub: bulk textarea, mỗi dòng map 1-1 với hanzi

import { useFormStatus, useFormState } from 'react-dom'
import { useState, useEffect } from 'react'
import Toast from '@/components/ui/Toast'

export default function EditSongForm({ song, lines, action }) {
  const [state, formAction] = useFormState(action, null)
  const [toastMsg, setToastMsg] = useState('')

  // Gộp vietsub hiện tại thành 1 textarea (giữ dòng trắng để mapping đúng)
  const initialVietsub = lines.map(l => l.vietsub ?? '').join('\n')
  const [vietText, setVietText] = useState(initialVietsub)

  useEffect(() => {
    if (state?.error) setToastMsg(state.error)
  }, [state])

  const vietLines  = vietText.split('\n').length
  const mismatch   = lines.length > 0 && vietLines !== lines.length

  return (
    <>
    <Toast message={toastMsg} type="error" onClose={() => setToastMsg('')} />
    <div className="flex flex-col gap-5 max-w-3xl">

      {/* Metadata */}
      <form action={formAction} className="card flex flex-col gap-4">
        <p className="text-[13px] font-medium text-gray-700 mb-1">Thông tin bài hát</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-gray-600">Tên bài hát *</label>
            <input name="title" required defaultValue={song.title} className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-gray-600">Ca sĩ</label>
            <input name="artist" defaultValue={song.artist ?? ''} className="input" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">YouTube URL</label>
          <input name="youtube_url" type="url" defaultValue={song.youtube_url ?? ''} className="input" placeholder="https://youtube.com/watch?v=..." />
        </div>

        {/* Vietsub — hidden field gửi cùng form */}
        <input type="hidden" name="vietsub" value={vietText} />

        {/* Lyrics side-by-side */}
        {lines.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-gray-700">Lyrics</p>
              {mismatch && (
                <p className="text-[13px] text-orange-600">
                  ⚠️ Hanzi {lines.length} dòng — Vietsub {vietLines} dòng
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Hanzi — read only */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-gray-400">Tiếng Trung (không thể sửa)</label>
                <textarea
                  readOnly
                  value={lines.map(l => l.hanzi).join('\n')}
                  rows={Math.min(lines.length + 2, 20)}
                  className="input resize-none font-mono text-[14px] leading-relaxed bg-gray-50 text-gray-500 cursor-default"
                />
                <p className="text-[12px] text-gray-400">{lines.length} dòng</p>
              </div>

              {/* Vietsub — editable */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-gray-400">Vietsub (sửa tại đây)</label>
                <textarea
                  value={vietText}
                  onChange={e => setVietText(e.target.value)}
                  rows={Math.min(lines.length + 2, 20)}
                  className="input resize-none text-[14px] leading-relaxed"
                  placeholder="Mỗi dòng tương ứng 1 dòng tiếng Trung..."
                />
                <p className="text-[12px] text-gray-400">{vietLines} dòng</p>
              </div>
            </div>

            <p className="text-[12px] text-gray-400">
              💡 Giữ số dòng bằng nhau. Dòng trống = không có vietsub cho dòng đó.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <a href={`/lyrics/${song.id}`} className="btn">Huỷ</a>
          <SubmitButton />
        </div>
      </form>
    </div>
    </>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? 'Đang lưu...' : '💾 Lưu thay đổi'}
    </button>
  )
}
