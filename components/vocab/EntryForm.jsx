'use client'

// EntryForm — dùng cho cả Add (/vocab/new) và Edit (/vocab/[id])
// Auto-fill: nút ⚡ Load → pinyin-pro + Google Translate
// Examples: dynamic list, mỗi item { hanzi, pinyin, vi }, submit qua hidden JSON input

import { useFormStatus, useFormState } from 'react-dom'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Toast from '@/components/ui/Toast'

const EMPTY_EXAMPLE = { hanzi: '', pinyin: '', vi: '' }

export default function EntryForm({ action, initial, back }) {
  const isEdit     = !!initial
  const searchParams = useSearchParams()

  // useFormState: bắt giá trị return từ Server Action ({ error } | null)
  // action phải có signature (prevState, formData) — xem entries.js
  const [state, formAction] = useFormState(action, null)
  const [toastMsg, setToastMsg] = useState('')

  // Khi Server Action trả về { error }, hiện toast
  useEffect(() => {
    if (state?.error) setToastMsg(state.error)
  }, [state])

  // ── Core fields ───────────────────────────────────────────────────────────
  const [typeVal,   setTypeVal]   = useState(initial?.type       ?? 'vocab')
  const [hanzi,     setHanzi]     = useState(initial?.hanzi      ?? '')
  const [pinyinVal, setPinyinVal] = useState(initial?.pinyin     ?? '')
  const [meaningVi, setMeaningVi] = useState(initial?.meaning_vi ?? '')

  // ── Examples (array of { hanzi, pinyin, vi }) ────────────────────────────
  const [examples, setExamples] = useState(() => {
    if (initial?.examples?.length) return initial.examples
    // Migrate data cũ nếu có
    if (initial?.example) return [{ hanzi: initial.example, pinyin: '', vi: initial.example_vi ?? '' }]
    return []
  })

  // ── URL params (chỉ ở add mode) ───────────────────────────────────────────
  useEffect(() => {
    if (!initial) {
      const h = searchParams.get('hanzi') ?? ''
      const t = searchParams.get('type')  ?? ''
      if (h) setHanzi(h)
      if (t === 'pattern' || t === 'vocab') setTypeVal(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-fill load ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')
  const hasCJK = /[一-鿿㐀-䶿]/.test(hanzi)

  async function handleLoad() {
    if (!hanzi.trim() || !hasCJK) return
    setLoading(true); setLoadErr('')
    try {
      const res  = await fetch(`/api/lookup?hanzi=${encodeURIComponent(hanzi.trim())}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.pinyin)     setPinyinVal(data.pinyin)
      if (data.meaning_vi) setMeaningVi(data.meaning_vi)
    } catch { setLoadErr('Không load được, thử lại sau.') }
    finally  { setLoading(false) }
  }

  // ── Examples helpers ──────────────────────────────────────────────────────
  function addExample()       { setExamples(ex => [...ex, { ...EMPTY_EXAMPLE }]) }
  function removeExample(i)   { setExamples(ex => ex.filter((_, idx) => idx !== i)) }
  function updateExample(i, field, val) {
    setExamples(ex => ex.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  const inputClass = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                      outline-none focus:border-[#E24B4A] transition-colors`

  return (
    <>
      <Toast
        message={toastMsg}
        type="error"
        onClose={() => setToastMsg('')}
      />
    <form action={formAction} className="card max-w-2xl flex flex-col gap-4">
      {/* Truyền back URL xuống Server Action để redirect đúng sau save */}
      {back && <input type="hidden" name="back" value={back} />}

      {/* Row 1: Type + Source */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">Loại *</label>
          <select
            name="type"
            value={typeVal}
            onChange={e => setTypeVal(e.target.value)}
            className={inputClass}
          >
            <option value="vocab">Từ vựng</option>
            <option value="pattern">Cấu trúc / Pattern</option>
          </select>
        </div>

        <Field label="Nguồn" name="source" as="select" defaultValue={initial?.source ?? 'manual'}>
          <option value="manual">✏️ Manual</option>
          <option value="douyin">📱 Douyin</option>
          <option value="music">🎵 Nhạc</option>
          <option value="game">🎮 Game</option>
        </Field>
      </div>

      {/* Hanzi + Load */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-medium text-gray-600">Hanzi *</label>
          {!isEdit && (
            <button
              type="button"
              onClick={handleLoad}
              disabled={loading || !hasCJK}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md
                         border border-gray-200 bg-white text-gray-500
                         hover:border-[#E24B4A] hover:text-[#E24B4A] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : '⚡'}
              {loading ? 'Đang load...' : 'Load'}
            </button>
          )}
        </div>
        <input type="text" name="hanzi" value={hanzi} onChange={e => setHanzi(e.target.value)}
          placeholder="后悔" className={inputClass} />
        {loadErr && <p className="text-[11px] text-red-500 mt-0.5">{loadErr}</p>}
      </div>

      {/* Pinyin + HV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">
            Pinyin
            {!isEdit && pinyinVal && <span className="ml-1 text-[10px] text-green-500 font-normal">✓ auto</span>}
          </label>
          <input type="text" name="pinyin" value={pinyinVal} onChange={e => setPinyinVal(e.target.value)}
            placeholder="hòuhuǐ" className={inputClass} />
        </div>
        <Field label="Hán-Việt" name="hv" placeholder="Hối" defaultValue={initial?.hv} />
      </div>

      {/* Nghĩa VI + EN */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-gray-600">
            Nghĩa tiếng Việt *
            {!isEdit && meaningVi && <span className="ml-1 text-[10px] text-green-500 font-normal">✓ auto</span>}
          </label>
          <input type="text" name="meaning_vi" value={meaningVi} onChange={e => setMeaningVi(e.target.value)}
            placeholder="hối tiếc" className={inputClass} />
        </div>
        <Field label="Nghĩa tiếng Anh" name="meaning_en" placeholder="regret" defaultValue={initial?.meaning_en} />
      </div>

      {/* ── Ví dụ (dynamic) ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-gray-600">Ví dụ</p>
          <button
            type="button"
            onClick={addExample}
            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg
                       border border-dashed border-gray-300 text-gray-500
                       hover:border-[#E24B4A] hover:text-[#E24B4A] transition-colors"
          >
            + Thêm ví dụ
          </button>
        </div>

        {examples.length === 0 && (
          <p className="text-[12px] text-gray-400 italic">Chưa có ví dụ nào. Nhấn "+ Thêm ví dụ" để thêm.</p>
        )}

        {examples.map((ex, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-2 bg-gray-50/50">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-gray-400 font-medium">Ví dụ {i + 1}</span>
              <button
                type="button"
                onClick={() => removeExample(i)}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors px-1"
              >
                × Xoá
              </button>
            </div>

            {/* Hanzi ví dụ */}
            <input
              type="text"
              value={ex.hanzi}
              onChange={e => updateExample(i, 'hanzi', e.target.value)}
              placeholder="只对你坏，难道不算特别吗？"
              className={inputClass}
            />

            {/* Pinyin + Dịch — 2 cột */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={ex.pinyin}
                onChange={e => updateExample(i, 'pinyin', e.target.value)}
                placeholder="Zhǐ duì nǐ huài..."
                className={inputClass}
              />
              <input
                type="text"
                value={ex.vi}
                onChange={e => updateExample(i, 'vi', e.target.value)}
                placeholder="Chỉ tệ với mình em thôi..."
                className={inputClass}
              />
            </div>
          </div>
        ))}

        {/* Hidden input gửi examples JSON lên server */}
        <input type="hidden" name="examples" value={JSON.stringify(examples)} />
      </div>

      {/* Ghi chú */}
      <Field
        label="Ghi chú thêm"
        name="notes"
        as="textarea"
        placeholder="Pattern liên quan, cách dùng, sắc thái..."
        defaultValue={initial?.notes}
      />

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <a href="/vocab" className="btn">Huỷ</a>
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
      {pending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : '+ Thêm từ'}
    </button>
  )
}

function Field({ label, name, as = 'input', placeholder, defaultValue, children }) {
  const baseClass = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                     outline-none focus:border-[#E24B4A] transition-colors`
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-gray-600">{label}</label>
      {as === 'select' ? (
        <select name={name} defaultValue={defaultValue} className={baseClass}>{children}</select>
      ) : as === 'textarea' ? (
        <textarea name={name} placeholder={placeholder} defaultValue={defaultValue}
          rows={3} className={`${baseClass} resize-none`} />
      ) : (
        <input type="text" name={name} placeholder={placeholder} defaultValue={defaultValue} className={baseClass} />
      )}
    </div>
  )
}
