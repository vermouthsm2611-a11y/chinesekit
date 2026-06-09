# ChineseKit

Web app cá nhân học tiếng Trung — quản lý từ vựng, ôn flashcard, xem lyrics với click-to-lookup.  
Stack: **Next.js 14 App Router** + **Supabase** (PostgreSQL) + **Tailwind CSS**.

---

## Khởi động

```bash
cd chinesekit
npm install
npm run dev        # http://localhost:3000
```

Yêu cầu file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Cấu trúc

```
chinesekit/
├── app/
│   ├── page.jsx                  # Dashboard (force-dynamic — streak/reviewedToday realtime)
│   ├── layout.jsx                # Root layout (Sidebar + BottomNav)
│   ├── loading.jsx               # Skeleton toàn trang
│   ├── vocab/
│   │   ├── page.jsx              # Danh sách từ vựng — chỉ type='vocab'
│   │   ├── loading.jsx           # Skeleton
│   │   ├── new/page.jsx          # Thêm từ mới
│   │   └── [id]/page.jsx         # Sửa từ (context-aware back navigation)
│   ├── flashcard/
│   │   ├── page.jsx              # Flashcard session (score-based priority)
│   │   └── loading.jsx
│   ├── lyrics/
│   │   ├── page.jsx              # Danh sách bài hát
│   │   ├── loading.jsx
│   │   ├── new/page.jsx          # Thêm bài hát + auto-translate
│   │   └── [id]/
│   │       ├── page.jsx          # Viewer (click-to-lookup, pinyin toggle)
│   │       └── edit/page.jsx     # Sửa vietsub
│   ├── patterns/
│   │   ├── page.jsx              # Cấu trúc ngữ pháp (accordion) — chỉ type='pattern'
│   │   └── loading.jsx
│   ├── stats/
│   │   ├── page.jsx              # Thống kê + streak + biểu đồ
│   │   └── loading.jsx
│   ├── settings/
│   │   ├── page.jsx              # Cài đặt (daily goal, flashcard count, export)
│   │   └── loading.jsx
│   └── api/
│       ├── lookup/route.js       # GET /api/lookup?hanzi= → pinyin + nghĩa
│       └── export/route.js       # GET /api/export?format=csv|json
│
├── app/actions/
│   ├── entries.js                # addEntry, updateEntry, deleteEntry (Server Actions)
│   ├── songs.js                  # addSong, updateSong, deleteSong
│   └── settings.js               # saveSettings, clearReviewLog
│
├── components/
│   ├── Sidebar.jsx               # Desktop nav (hidden on mobile)
│   ├── BottomNav.jsx             # Mobile bottom tab bar
│   ├── DeleteButton.jsx          # Confirm-before-delete pattern
│   ├── ui/
│   │   └── Toast.jsx             # Auto-dismiss toast (error/success/warn)
│   ├── dashboard/                # StatCard, FlashcardPreview, RecentEntries, SongsWidget
│   ├── vocab/
│   │   ├── EntryForm.jsx         # Form thêm/sửa (useFormState + Toast error)
│   │   └── VocabList.jsx         # Dual layout: table desktop / card rows mobile
│   ├── flashcard/
│   │   └── FlashcardSession.jsx  # Flip card + rating + review log
│   ├── lyrics/
│   │   ├── AddSongForm.jsx       # Paste lyrics + auto-translate vietsub
│   │   ├── LyricsViewer.jsx      # Ruby pinyin, click-to-lookup, sticky toolbar
│   │   ├── EditSongForm.jsx      # Sửa vietsub bulk textarea
│   │   └── WordPopup.jsx         # Popup tra từ + link thêm/sửa với ?back=
│   ├── patterns/
│   │   └── PatternList.jsx       # Accordion cards, multiple examples, sticky toolbar
│   ├── stats/
│   │   ├── ActivityChart.jsx     # CSS-only 14-day bar chart
│   │   └── ResultsDonut.jsx      # Kết quả ôn tập breakdown
│   └── settings/
│       └── SettingsForm.jsx      # Form settings + export + danger zone
│
├── lib/
│   ├── supabase.js               # Singleton Supabase client
│   └── settings.js               # getSettings() helper + DEFAULTS
│
└── supabase/
    ├── schema.sql                # Schema đầy đủ
    ├── add_examples_column.sql   # Migration: thêm cột examples JSONB
    └── add_settings_table.sql    # Migration: tạo bảng settings
```

---

## Database Schema (Supabase)

### `entries`
| Cột | Type | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `type` | text | `'vocab'` hoặc `'pattern'` — pages riêng biệt |
| `hanzi` | text | |
| `pinyin` | text | |
| `hv` | text | Hán-Việt |
| `meaning_vi` | text | |
| `meaning_en` | text | |
| `notes` | text | |
| `source` | text | `'douyin'` / `'music'` / `'game'` / `'manual'` |
| `examples` | jsonb | `[{hanzi, pinyin, vi}]` |
| `created_at` | timestamptz | |

### `review_log`
| Cột | Type | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `entry_id` | uuid FK → entries | |
| `result` | text | `'correct'` / `'incorrect'` / `'skip'` |
| `reviewed_at` | timestamptz | default now() |

### `songs`
| Cột | Type |
|---|---|
| `id` | uuid PK |
| `title` | text |
| `artist` | text |
| `youtube_url` | text |

### `song_lines`
| Cột | Type | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `song_id` | uuid FK → songs | |
| `line_order` | int | thứ tự dòng |
| `hanzi` | text | |
| `vietsub` | text | |

### `settings`
| `key` | `value` (default) |
|---|---|
| `daily_goal` | `'20'` |
| `flashcard_count` | `'20'` |
| `lyrics_show_pinyin` | `'false'` |

---

## Tính năng chính

| Trang | Tính năng |
|---|---|
| Dashboard | Stats thật, streak, flashcard preview, nguồn học |
| Từ vựng | Chỉ `type='vocab'`, search + filter nguồn + sort, table desktop 8 cột / card rows mobile |
| Patterns | Chỉ `type='pattern'`, accordion, multiple examples |
| Flashcard | Score-based priority (incorrect×2 - correct), shuffle sau mount |
| Lyrics | Auto-translate vietsub, pinyin toggle, click-to-lookup, sticky toolbar |
| Thống kê | Streak, 14-day chart CSS, results donut, top reviewed |
| Cài đặt | Daily goal, flashcard count, export CSV/JSON, clear log |

---

## Các pattern quan trọng

- **Server Actions** — signature `(prevState, formData)` khi dùng với `useFormState`; bind id: `action.bind(null, id)`
- **Error handling** — `return { error }` thay vì `throw`; `useFormState` bắt lỗi → show Toast
- **revalidatePath** — dùng targeted path (`/vocab`, `/patterns`...), **không** dùng `revalidatePath('/', 'layout')` — gây 2s delay mỗi navigation
- **force-dynamic** — chỉ dùng cho `/` (Dashboard) vì cần streak/reviewedToday realtime; các page khác không cần
- **loading.jsx** — có ở tất cả routes, dùng `animate-pulse` skeleton
- **Sticky toolbar** — `sticky top-0 z-10 bg-[#F7F7F5]` cho VocabList, PatternList, LyricsViewer
- **Dual layout VocabList** — `md:hidden` card rows mobile, `hidden md:block` table desktop
- **`useSearchParams()` cần `<Suspense>`** — bọc component dùng hook này hoặc hydration failure
- **Hydration với `Math.random()`** — shuffle trong `useEffect`, không trong `useState`
- **Context-aware back navigation** — `?back=<path>` truyền qua URL → redirect sau save

> Xem `PROJECT_NOTES.md` để biết chi tiết bug và quyết định kỹ thuật.
