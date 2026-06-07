# PROJECT_NOTES — ChineseKit

> Ghi lại bug, phát hiện kỹ thuật, và quyết định thiết kế quan trọng.  
> **1 file duy nhất** — append thêm section khi có phát hiện mới.

---

## MỤC LỤC

- [Next.js App Router](#nextjs-app-router)
- [Supabase](#supabase)
- [External APIs](#external-apis)
- [Flashcard](#flashcard)
- [Navigation](#navigation)

---

## NEXT.JS APP ROUTER

### `useSearchParams()` bắt buộc cần `<Suspense>`

Bất kỳ Client Component nào dùng `useSearchParams()` phải được bọc trong `<Suspense>` ở page cha. Nếu không → hydration failure → form submit như native HTML → Server Action không chạy.

```jsx
// app/vocab/new/page.jsx
<Suspense fallback={<div className="animate-pulse" />}>
  <EntryForm action={addEntry} />
</Suspense>
```

**Triệu chứng khi thiếu:** Form submit không save, không báo lỗi, page reload về trạng thái cũ.

---

### `revalidatePath` phải dùng `'layout'` scope

`revalidatePath('/vocab')` chỉ revalidate server cache, **không clear Router Cache client-side**. User phải Ctrl+F5 mới thấy dữ liệu mới.

```js
// SAI — chỉ clear server cache
revalidatePath('/vocab')

// ĐÚNG — clear toàn bộ Router Cache client
revalidatePath('/', 'layout')
```

---

### Hydration bug với `Math.random()` trong `useState`

SSR generate số random khác client → hydration mismatch error.

```js
// SAI — Math.random() chạy cả SSR lẫn client
const [deck, setDeck] = useState(() => shuffle(entries))

// ĐÚNG — shuffle sau mount
const [deck, setDeck] = useState(entries)
useEffect(() => {
  setDeck(shuffle(entries))
}, [])
```

---

### `export const dynamic = 'force-dynamic'`

Cần thêm vào page nào đọc settings hoặc data thay đổi thường xuyên. Không có flag này → Next.js cache response → settings update không có hiệu lực.

Các page đang dùng: `/flashcard`, `/patterns`, `/stats`, `/settings`.

---

## SUPABASE

### Singleton client pattern

```js
// lib/supabase.js — dùng chung 1 instance
export const supabase = createClient(url, key)
```

Không tạo client mới trong mỗi component/action — gây nhiều connection pool.

### JSONB examples column

`examples` column lưu `[{hanzi, pinyin, vi}]`. Migration đã chạy (`supabase/add_examples_column.sql`).

Backward compat: nếu `examples = []` → fallback đọc `example` + `example_vi` (cột cũ).

### Settings table

Key-value store đơn giản. `getSettings()` trong `lib/settings.js` trả về object đã parse với DEFAULTS fallback.

```js
// Luôn dùng helper này, không query trực tiếp
import { getSettings } from '@/lib/settings'
const { dailyGoal, flashcardCount, lyricsShowPinyin } = await getSettings()
```

---

## EXTERNAL APIS

### Google Translate unofficial

```
GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=<text>
```

**Parse response:**
```js
const data = await res.json()
const translation = data[0].map(seg => seg[0]).join('')
```

**Giới hạn:** Không có giới hạn rõ ràng nhưng không nên gửi quá nhiều request liên tiếp. Lyrics dài → join tất cả lines thành 1 request duy nhất (phân cách `\n`), split lại sau.

**Không dùng cho production thương mại** — unofficial API, không có SLA.

### `/api/lookup` (internal)

```
GET /api/lookup?hanzi=你好
Response: { pinyin: "nǐ hǎo", meaning_vi: "xin chào" }
```

Cache 24h (`next: { revalidate: 86400 }`). Dùng `pinyin-pro` cho pinyin, Google Translate cho nghĩa.

---

## FLASHCARD

### Score-based priority

Tính từ `review_log`:

```
score = incorrect × 2 - correct + skip × 1
```

- Chưa ôn bao giờ → `score = undefined` → ưu tiên cao nhất (float lên đầu)
- Sort giảm dần theo score → slice `flashcard_count` → shuffle client-side

Logic nằm trong `app/flashcard/page.jsx` (server-side, trước khi pass xuống component).

---

## NAVIGATION

### Context-aware back navigation

Khi navigate đến `/vocab/[id]` hoặc `/vocab/new` từ lyrics/patterns, truyền `?back=<path>`:

```
/vocab/[id]?back=/lyrics/123
/vocab/new?back=/patterns
```

- Page đọc `searchParams.back` → cập nhật breadcrumb label
- `EntryForm` nhận `back` prop → hidden input → Server Action redirect về đó sau save
- `WordPopup` dùng `window.location.pathname` làm back value

**Validate:** `redirect(back && back.startsWith('/') ? back : '/vocab')` — chặn open redirect.
