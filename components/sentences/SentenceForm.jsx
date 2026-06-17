'use client'

// SentenceForm — dùng cho cả Add (/sentences/new) và Edit (/sentences/[id])
// Auto pinyin: pinyin-pro generate trên client khi nhấn ⚡

import { useFormStatus, useFormState } from 'react-dom'
import { useState, useEffect } from 'react'
import { pinyin } from 'pinyin-pro'
import Toast from '@/components/ui/Toast'

export default function SentenceForm({ action, initial }) {
  const isEdit = !!initial
  const [state, formAction] = useFormState(action, null)
  const [toastMsg, setToastMsg] = useState('')

  const [hanzi,     setHanzi]     = useState(initial?.hanzi      ?? '')
  const [pinyinVal, setPinyinVal] = useState(initial?.pinyin     ?? '')

  useEffect(() => {
    if (state?.error) setToastMsg(state.error)
  }, [state])

  // Auto-generate pinyin từ hanzi bằng pinyin-pro (client-side)
  function handleGenPinyin() {
    if (!hanzi.trim()) return
    const gen = pinyin(hanzi, { toneType: 'symbol', separator: ' ' })
    setPinyinVal(gen)
  }

  const hasCJK = /[一-鿿㐀-䶿]/.test(hanzi)

  const inputClass = `w-full px-3.5 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white
                      outline-none focus:border-[var(--pink)] transition-colors`

  return (
    <>
      <Toast message={toastMsg} type="error" onClose={() => setToastMsg('')} />
      <form action={formAction} className="card max-w-2xl flex flex-col gap-4">

        {/* Câu hanzi */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-gray-600">Câu tiếng Trung *</label>
          <textarea
            name="hanzi"
            value={hanzi}
            onChange={e => setHanzi(e.target.value)}
            placeholder="只对你坏，难道不算特别吗？"
            rows={3}
            className={`${inputClass} resize-none font-mono`}
          />
        </div>

        {/* Pinyin */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-gray-600">Pinyin</label>
            <button
              type="button"
              onClick={handleGenPinyin}
              disabled={!hasCJK}
              className="inline-flex items-center gap-1 text-[13px] px-2 py-0.5 rounded-md
                         border border-gray-200 bg-white text-gray-500
                         hover:border-[var(--pink)] hover:text-[var(--pink)] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⚡ Tự động
            </button>
          </div>
          <input
            type="text"
            name="pinyin"
            value={pinyinVal}
            onChange={e => setPinyinVal(e.target.value)}
            placeholder="Zhǐ duì nǐ huài, nándào bù suàn tèbié ma?"
            className={inputClass}
          />
        </div>

        {/* Nghĩa */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-gray-600">Nghĩa tiếng Việt *</label>
          <input
            type="text"
            name="meaning_vi"
            defaultValue={initial?.meaning_vi ?? ''}
            placeholder="Chỉ tệ với mình em thôi, chẳng lẽ không tính là đặc biệt sao?"
            className={inputClass}
          />
        </div>

        {/* Ghi chú */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-gray-600">Ghi chú</label>
          <textarea
            name="notes"
            defaultValue={initial?.notes ?? ''}
            placeholder="Ngữ cảnh, cách dùng, nguồn..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <a href="/sentences" className="btn">Huỷ</a>
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </>
  )
}

function SubmitButton({ isEdit }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
      {pending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : '+ Thêm câu'}
    </button>
  )
}
