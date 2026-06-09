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
