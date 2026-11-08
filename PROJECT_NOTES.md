# PROJECT_NOTES — ChineseKit

> Ghi lại bug, phát hiện kỹ thuật, và quyết định thiết kế quan trọng.  
> **1 file duy nhất** — append thêm section khi có phát hiện mới.

---

## MỤC LỤC

- [Next.js App Router](#nextjs-app-router)
- [Performance](#performance)
- [Error Handling](#error-handling)
- [Supabase](#supabase)
- [External APIs](#external-apis)
- [Flashcard](#flashcard)
- [Navigation](#navigation)
- [UI Patterns](#ui-patterns)
- [Roadmap](#roadmap)

---

## NEXT.JS APP ROUTER

### `useSearchParams()` bắt buộc cần `<Suspense>`

Bất kỳ Client Component nào dùng `useSearchParams()` phải được bọc trong `<Suspense>` ở page cha. Nếu không → hydration failure → form submit như native HTML → Server Action không chạy.

```jsx
<Suspense fallback={<div className="animate-pulse" />}>
  <EntryForm action={addEntry} />
</Suspense>
```

**Triệu chứng khi thiếu:** Form submit không save, không báo lỗi, page reload về trạng thái cũ.

---

### Hydration bug với `Math.random()` trong `useState`

SSR generate số random khác client → hydration mismatch error.

```js
// SAI
const [deck, setDeck] = useState(() => shuffle(entries))

// ĐÚNG — shuffle sau mount
const [deck, setDeck] = useState(entries)
useEffect(() => { setDeck(shuffle(entries)) }, [])
```

---

### Server Action signature với `useFormState`

Khi dùng `useFormState`, action **bắt buộc** có signature `(prevState, formData)`.  
Khi bind id: `action.bind(null, id)` → được gọi là `action(id, prevState, formData)`.

```js
// actions/entries.js
export async function updateEntry(id, prevState, formData) { ... }

// component
const boundAction = updateEntry.bind(null, entry.id)
const [state, formAction] = useFormState(boundAction, null)
```

---

## PERFORMANCE

### `revalidatePath('/', 'layout')` gây 2s delay

`revalidatePath('/', 'layout')` xóa **toàn bộ** Router Cache → mỗi navigation sau đó là cold SSR.

**Fix:** Dùng targeted revalidation đúng page bị ảnh hưởng:

```js
// entries.js actions
revalidatePath('/vocab')
revalidatePath('/patterns')
revalidatePath('/')

// songs.js actions
revalidatePath('/lyrics')
revalidatePath('/')

// settings.js actions
revalidatePath('/settings')
revalidatePath('/flashcard')
revalidatePath('/')
```

### `force-dynamic` chỉ dùng cho Dashboard

`force-dynamic` trên nhiều page → mọi navigation đều cold SSR. Chỉ `/` (Dashboard) cần vì streak và `reviewedToday` phụ thuộc thời gian thực.

```js
// app/page.jsx — CÓ force-dynamic (cần)
export const dynamic = 'force-dynamic'

// app/vocab/page.jsx, app/patterns/page.jsx, app/settings/page.jsx — KHÔNG cần
// targeted revalidatePath từ actions đủ để keep data fresh
```

### loading.jsx skeleton

Có ở tất cả routes — hiển thị ngay khi navigate, che đi thời gian SSR fetch:

```
app/loading.jsx
app/vocab/loading.jsx
app/patterns/loading.jsx
app/flashcard/loading.jsx
app/lyrics/loading.jsx
app/stats/loading.jsx
app/settings/loading.jsx
```

Dùng `animate-pulse` với skeleton shape khớp layout thực tế của từng page.

---

## ERROR HANDLING

### `throw new Error` trong Server Actions → Next.js runtime overlay

Dùng `return { error }` thay `throw` để bắt lỗi gracefully:

```js
// SAI — hiện runtime overlay đỏ
if (error) throw new Error(error.message)

// ĐÚNG — trả về để component xử lý
if (error) return { error: `Lỗi database: ${error.message}` }
```

### Toast pattern cho form errors

```jsx
// component dùng useFormState
const [state, formAction] = useFormState(action, null)
const [toastMsg, setToastMsg] = useState('')

useEffect(() => {
  if (state?.error) setToastMsg(state.error)
}, [state])

return (
  <>
    <Toast message={toastMsg} type="error" onClose={() => setToastMsg('')} />
    <form action={formAction}>...</form>
  </>
)
```

`SettingsForm` dùng manual `handleSubmit` (không qua `useFormState`) vì cần show "Đã lưu" state:

```js
async function handleSubmit(formData) {
  const result = await action(null, formData)  // truyền null làm prevState
  if (result?.error) setToastMsg(result.error)
  else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
}
```

---

## SUPABASE

### Singleton client pattern

```js
// lib/supabase.js — dùng chung 1 instance
export const supabase = createClient(url, key)
```

Không tạo client mới trong mỗi component/action.

### JSONB examples column

`examples` lưu `[{hanzi, pinyin, vi}]`. Fallback backward compat:

```js
function getFirstExample(entry) {
  if (entry.examples?.length) return entry.examples[0]           // new format
  if (entry.example) return { hanzi: entry.example, pinyin: null, vi: null }  // old format
  return null
}
```

### Settings — array upsert

Upsert tất cả settings trong 1 request thay vì sequential loop:

```js
const pairs = [
  { key: 'daily_goal', value: '...' },
  { key: 'flashcard_count', value: '...' },
  { key: 'lyrics_show_pinyin', value: '...' },
]
await supabase.from('settings').upsert(pairs, { onConflict: 'key' })
```

---

## EXTERNAL APIS

### Google Translate unofficial

```
GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=<text>
```

```js
const data = await res.json()
const translation = data[0].map(seg => seg[0]).join('')
```

Lyrics dài → join tất cả lines thành 1 request (phân cách `\n`), split lại sau.  
**Không dùng cho production thương mại.**

### `/api/lookup` (internal)

```
GET /api/lookup?hanzi=你好
Response: { pinyin: "nǐ hǎo", meaning_vi: "xin chào" }
```

Cache 24h (`next: { revalidate: 86400 }`). Dùng `pinyin-pro` + Google Translate.

---

## FLASHCARD

### Score-based priority

```
score = incorrect × 2 - correct + skip × 1
```

- Chưa ôn bao giờ → `score = undefined` → float lên đầu
- Sort giảm dần → slice `flashcard_count` → shuffle client-side (`useEffect`)

Logic nằm server-side trong `app/flashcard/page.jsx`.

---

## NAVIGATION

### Context-aware back navigation

```
/vocab/[id]?back=/lyrics/123
/vocab/new?back=/patterns
```

- `EntryForm` nhận `back` prop → hidden input → Server Action redirect sau save
- `WordPopup` dùng `window.location.pathname` làm back value
- **Validate:** `redirect(back && back.startsWith('/') ? back : '/vocab')` — chặn open redirect

---

## UI PATTERNS

### Vocab/Patterns tách biệt

`/vocab` chỉ fetch `type='vocab'`, `/patterns` chỉ fetch `type='pattern'`. Không mix.

```js
// app/vocab/page.jsx
.eq('type', 'vocab')

// app/patterns/page.jsx
.eq('type', 'pattern')
```

### VocabList — Dual layout

- **Mobile** (`md:hidden`): card rows — hanzi + pinyin right-aligned + nghĩa + example block border-left
- **Desktop** (`hidden md:block`): full-width table 8 cột — Hanzi | Hán-Việt | Pinyin | Nghĩa | Ghi chú | Ví dụ | Pinyin/Dịch | Nguồn+Sửa

Pinyin và Hán-Việt dùng `lowercase` CSS để enforce consistent casing.

### Sticky toolbar pattern

```jsx
<div className="sticky top-0 z-10 bg-[#F7F7F5] pb-3">
  {/* search + filter */}
</div>
```

Áp dụng: `VocabList`, `PatternList`, `LyricsViewer`.

### Toast component

`components/ui/Toast.jsx` — auto-dismiss 4s, 3 types: `error` / `success` / `warn`.  
Dùng ở: `EntryForm`, `AddSongForm`, `EditSongForm`, `SettingsForm`.

---

## ROADMAP

Các cải tiến đáng làm theo thứ tự ưu tiên:

1. **Pagination / infinite scroll** — cấp thiết khi entries > 200
2. **Tone colors trên pinyin** — màu theo thanh điệu (ít code, giá trị học tập cao)
3. **Search toàn cục** — across vocab + patterns + lyrics
4. **Flashcard SRS** — 3 bucket: mới / đang học / đã nhớ
5. **Tag/category tự do** — gom nhóm theo chủ đề ngoài `source`
6. **Quick-add từ lyrics** — click từ lạ trong lyrics → thêm thẳng vào vocab

---

## SESSION — UI Polish & Typography Scale (2026-06-17)

### Design tokens — sidebar width

`--sidebar-w` cập nhật từ 220px → 260px. Ba nơi phải sync:
- `design-tokens.css` — `--sidebar-w: 260px`
- `components/Sidebar.jsx` — `w-[260px]`
- `app/layout.jsx` — `ml-[260px]`

### Sticky toolbar — dùng CSS var thay hardcode

```jsx
// SAI — hardcode màu nền
<div className="sticky top-0 z-10 bg-[#F7F7F5]">

// ĐÚNG — CSS var, tự adapt khi đổi theme
<div className="sticky top-0 z-10" style={{ background: 'var(--bg-base)' }}>
```

### PatternList — grid 1:1 thay accordion header đơn cột

Vấn đề: Header accordion chỉ có hanzi + pinyin → cột trái trống khi không điền meaning_en/hv.

Fix: `grid grid-cols-1 md:grid-cols-2` — cột trái (cấu trúc), cột phải (ví dụ đầu tiên), cùng row structure `hanzi / pinyin / nghĩa`. Extra examples + ghi chú vẫn accordion bên dưới.

### SentenceList — 3-column desktop

```jsx
<div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr] md:items-center gap-x-6">
  <p className="hanzi text-[24px]">{hanzi}</p>
  <PinyinText className="text-[16px]" />
  <p className="text-[17px] lowercase">{meaning_vi}</p>
</div>
```

### Typography scale áp dụng

| Element | Before | After |
|---|---|---|
| Lyrics hanzi | 20px | 32px |
| Lyrics pinyin `<rt>` | 11px | 16px |
| Lyrics vietsub | 15px | 18px |
| Sidebar nav | 15px | 18px |
| Page h1 | text-2xl | 30px semibold |
| Filter pills | text-sm | 16px |
| Section label | 11px | 12px |

### JSX comment gotchas — 2 trường hợp build lỗi

```jsx
// CASE 1: comment ngay sau return (
return (
  {/* SAI — parse error */}
  <div>

// Fix: dùng // comment TRÊN return
// Mobile: ...
return (
  <div>

// CASE 2: comment trong ternary ) : (
) : (
  {/* SAI */}
  <div>

// Fix: dùng block comment
) : (
  /* comment */
  <div>
```

### Server Component — event handlers bị reject

`onMouseEnter`/`onMouseLeave` không thể dùng trong Server Components. Phải remove hoặc chuyển component sang `'use client'`.

### System reminder truncation — workaround

Hệ thống truncate file khi hiển thị diff trong system reminder. **Workaround:** dùng `python3` để ghi file in-place thay vì `Edit` tool cho các đoạn dài. Luôn verify bằng `tail` + brace count sau mỗi lần sửa.

---

## SESSION — Ẩn tính năng, bỏ `source`, Import JSON (2026-11-06)

App hiện chủ yếu dùng để **LƯU** từ vựng / câu / cấu trúc. Flashcard + Lyrics không dùng → ẩn (không xóa).

### Feature flags — `lib/features.js`

```js
export const FEATURES = { flashcard: false, lyrics: false }
```

- `flashcard` gồm: `/flashcard`, `/stats` (toàn bộ là dữ liệu `review_log`), thẻ "Ôn hôm nay" / "Streak" /
  FlashcardPreview trên Dashboard, cài đặt mục tiêu + số thẻ, nút xóa lịch sử ôn tập.
- `lyrics` gồm: `/lyrics/*`, SongsWidget trên Dashboard, cài đặt pinyin lyrics.
- `middleware.js` chặn route của tính năng tắt → redirect `/` (chặn trước khi render → không truy vấn DB).
- Sidebar lọc mục theo `feature`, section rỗng tự ẩn. BottomNav cố định: Home / Từ vựng / Cấu trúc / Câu / Cài đặt.
- Dashboard chỉ truy vấn phần đang bật (11 → 4 query khi tắt cả 2). Thẻ số: Từ vựng / Cấu trúc / Câu.
- **Bật lại:** đổi `false` → `true`. Nhớ xử lý lỗi tiềm ẩn ở SettingsForm (mục cuối).

### Bỏ `source` khỏi UI — cột DB vẫn còn

- Đã bỏ: ô chọn Nguồn (EntryForm), lọc + cột Nguồn (VocabList), nhãn nguồn (PatternList), lọc nguồn (flashcard),
  thẻ "Nguồn học" (Dashboard, Stats), cột `source` trong Export.
- `addEntry` / `updateEntry` không gửi `source` → insert lấy mặc định `manual`, update không đụng tới.
  (Nếu chỉ bỏ ô chọn mà giữ code cũ, `updateEntry` sẽ ghi `null`.)
- Xóa hẳn cột khi muốn: `ALTER TABLE entries DROP COLUMN source;` (index `idx_entries_source` tự xóa theo).

### Import JSON — `app/actions/import.js` + `components/settings/ImportCard.jsx`

- Nhận file từ doubao_vietsub (`chinesekit_*.json`) hoặc file Export của chính app.
- `type: 'sentence'` → bảng `sentences`; `vocab` / `pattern` (mặc định `vocab`) → `entries` (kèm `examples`).
- Bỏ qua: sai định dạng, trùng hanzi trong file, hanzi đã có ở **entries HOẶC sentences**. `source` / `created_at`
  trong file bị bỏ qua.
- `.in('hanzi', …)` chia lô 100 — PostgREST đặt filter vào URL, danh sách dài vượt giới hạn độ dài URL.
- `meaning_vi: ""` vẫn import (hợp lệ với `NOT NULL`); KHÔNG bỏ `NOT NULL` vì `VocabList` gọi
  `e.meaning_vi.toLowerCase()` và index full-text `hanzi || ' ' || meaning_vi` sẽ thành NULL.
- Bảng `sentences` không có trong `schema.sql` (tạo trực tiếp trên Supabase): cột hanzi / pinyin / meaning_vi / notes.

### `revalidatePath` trong Server Action → mất state client

**Triệu chứng:** import CÓ thêm mục → trang "load nhẹ", toast không hiện. Import toàn mục đã có (không gọi
`revalidatePath`) → toast hiện bình thường.

**Nguyên nhân:** Server Action gọi `revalidatePath` → Next.js làm mới route hiện tại trong cùng response →
`/settings` (có `loading.jsx`) bị dựng lại → component có state cục bộ bị tạo mới → `setState` sau `await` rơi vào
component cũ đã gỡ. (Suy luận từ triệu chứng, chưa quan sát trực tiếp — fix bên dưới đúng bất kể thứ tự.)

**Fix:** đưa state ra **kho cấp module** + `useSyncExternalStore` (`components/settings/importToastStore.js`).
Module JS không bị dựng lại → component cũ hay mới đều đọc được.
KHÔNG bỏ `revalidatePath`: `/vocab` là trang tĩnh, không revalidate thì từ mới không hiện.

### ⚠️ Lỗi tiềm ẩn: SettingsForm "✓ Đã lưu"

`saveSettings` gọi `revalidatePath('/settings')` mà "✓ Đã lưu" là `useState` cục bộ → có thể dính lỗi y hệt mục trên.
Chưa sửa vì form đang ẩn (flashcard + lyrics tắt). Bật lại tính năng thì xử lý theo cùng cách.
`saveSettings` đã sửa: chỉ lưu field đang hiện trên form (`formData.has`; checkbox lyrics dùng marker
`lyrics_section`) → field bị ẩn không ghi đè giá trị cũ.
