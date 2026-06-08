'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { useState, useRef, useEffect } from 'react'
import Toast from '@/components/ui/Toast'

export default function AddSongForm({ action }) {
  const [state, formAction] = useFormState(action, null)
  const [toastMsg, setToastMsg] = useState('')

  const [hanziText, setHanziText] = useState('')
  const [vietText,  setVietText]  = useState('')
  const [translating, setTranslating] = useState(false)
  const [transErr, setTransErr] = useState('')

  const vietRef = useRef(null)

  useEffect(() => {
    if (state?.error) setToastMsg(state.error)
  }, [state])

  const countLines = (text) => text.split('\n').filter(l => l.trim()).length
  const hanziLines = countLines(hanziText)
  const vietLines  = countLines(vietText)
  const mismatch   = hanziLines > 0 && vietLines > 0 && hanziLines !== vietLines

  // ── Auto-translate: gộp tất cả dòng thành 1 request ─────────────────────
  async function handleTranslate() {
    if (!hanziText.trim()) return
    setTranslating(true)
    setTransErr('')
    try {
      const lines = hanziText.split('\n').map(l => l.trim()).filter(Boolean)

      // Google Translate unofficial — ~5000 chars/req, no key needed
      // Giữ nguyên \n để GT dịch từng dòng đúng context, parse lại sau
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=${encodeURIComponent(lines.join('\n'))}`
      )
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()

      // GT trả: [ [ ["dịch", "gốc"], ... ], null, ... ]
      // Ghép tất cả segment lại thành 1 chuỗi, rồi split theo \n
      const fullText = data[0].map(seg => seg[0]).join('')
      const translated = fullText.split('\n').map(s => s.trim()).filter(Boolean)

      // Map 1-1 với dòng gốc; nếu lệch thì join hết để user tự xử
      const result = translated.length === lines.length
        ? translated.join('\n')
        : fullText.trim()

      setVietText(result)
      setTimeout(() => vietRef.current?.focus(), 100)
    } catch (e) {
      setTransErr('Dịch thất bại. Kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setTranslating(false)
    }
  }

  return (
    <>
    <Toast message={toastMsg} type="error" onClose={() => setToastMsg('')} />
    <form action={formAction} className="card max-w-3xl flex flex-col gap-5">

      {/* Thông tin bài hát */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">Tên bài hát *</label>
          <input name="title" required placeholder="只对你坏" className="input" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">Ca sĩ</label>
          <input name="artist" placeholder="周深" className="input" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-medium text-gray-600">YouTube URL (tuỳ chọn)</label>
        <input name="youtube_url" type="url" placeholder="https://youtube.com/watch?v=..."
          className="input" />
      </div>

      {/* Lyrics song song */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-medium text-gray-700">Lyrics</p>
          <div className="flex items-center gap-3">
            {mismatch && (
              <p className="text-[12px] text-orange-600">
                ⚠️ Hanzi {hanziLines} dòng — Vietsub {vietLines} dòng (lệch nhau)
              </p>
            )}
            {/* Nút dịch tự động */}
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating || !hanziText.trim()}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-lg
                         border border-gray-200 bg-white text-gray-600
                         hover:border-[#E24B4A] hover:text-[#E24B4A] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {translating
                ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : '⚡'}
              {translating ? 'Đang dịch...' : 'Dịch tự động'}
            </button>
          </div>
        </div>

        {transErr && (
          <p className="text-[12px] text-red-500 mb-2">{transErr}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Hanzi */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Tiếng Trung (mỗi dòng = 1 câu)</label>
            <textarea
              name="lyrics"
              rows={14}
              value={hanziText}
              onChange={e => setHanziText(e.target.value)}
              placeholder={"只对你坏\n难道不算特别吗\n..."}
              className="input resize-none font-mono text-[14px] leading-relaxed"
            />
            {hanziLines > 0 && (
              <p className="text-[11px] text-gray-400">{hanziLines} dòng</p>
            )}
          </div>

          {/* Vietsub */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">
              Vietsub (số dòng phải khớp)
              {vietText && !translating && (
                <span className="ml-1 text-green-500">✓ đã dịch</span>
              )}
            </label>
            <textarea
              ref={vietRef}
              name="vietsub"
              rows={14}
              value={vietText}
              onChange={e => setVietText(e.target.value)}
              placeholder={"Chỉ tệ với mình anh thôi\nChẳng lẽ không tính là đặc biệt sao\n..."}
              className="input resize-none text-[14px] leading-relaxed"
            />
            {vietLines > 0 && (
              <p className="text-[11px] text-gray-400">{vietLines} dòng</p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          💡 Có thể để trống vietsub — thêm sau trong phần chỉnh sửa.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <a href="/lyrics" className="btn">Huỷ</a>
        <SubmitButton />
      </div>
    </form>
    </>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? 'Đang lưu...' : '🎵 Thêm bài hát'}
    </button>
  )
}
