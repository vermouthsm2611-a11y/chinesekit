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
│   ├── page.jsx                  # Dashboard
│   ├── layout.jsx                # Root layout (Sidebar + BottomNav)
│   ├── vocab/
│   │   ├── page.jsx              # Danh sách từ vựng (search + filter + sort)
│   │   ├── new/page.jsx          # Thêm từ mới
│   │   └── [id]/page.jsx         # Sửa từ (context-aware back navigation)
│   ├── flashcard/page.jsx        # Flashcard session (score-based priority)
│   ├── lyrics/
│   │   ├── page.jsx              # Danh sách bài hát
│   │   ├── new/page.jsx          # Thêm bài hát + auto-translate
│   │   └── [id]/
│   │       ├── page.jsx          # Viewer (click-to-lookup, pinyin toggle)
│   │       └── edit/page.jsx     # Sửa vietsub
│   ├── patterns/page.jsx         # Cấu trúc ngữ pháp (accordion)
│   ├── stats/page.jsx            # Thống kê + streak + biểu đồ
│   ├── settings/page.jsx         # Cài đặt (daily goal, flashcard count, export)
│   └── api/
│       ├── lookup/route.js       # GET /api/lookup?hanzi= → pinyin + nghĩa
│       └── export/route.js       # GET /api/export?format=csv|json
│
├── actions/
│   ├── entries.js                # addEntry, updateEntry, deleteEntry (Server Actions)
│   ├── songs.js                  # addSong, updateSong, deleteSong
│   └── settings.js               # saveSettings
│
├── components/
│   ├── Sidebar.jsx               # Desktop nav (hidden on mobile)
│   ├── BottomNav.jsx             # Mobile bottom tab bar
│   ├── DeleteButton.jsx          # Confirm-before-delete pattern
│   ├── dashboard/                # StatCard, FlashcardPreview, RecentEntries, SongsWidget
│   ├── vocab/
│   │   ├── EntryForm.jsx         # Form thêm/sửa (auto-fill, dynamic examples)
│   │   └── VocabList.jsx         # Table với search + filter + sort + highlight
│   ├── flashcard/
│   │   └── FlashcardSession.jsx  # Flip card + rating + review log
│   ├── lyrics/
│   │   ├── AddSongForm.jsx       # Paste lyrics + auto-translate vietsub
│   │   ├── LyricsViewer.jsx      # Ruby pinyin, click-to-lookup
│   │   ├── EditSongForm.jsx      # Sửa vietsub bulk textarea
│   │   └── WordPopup.jsx         # Popup tra từ + link thêm/sửa với ?back=
│   ├── patterns/
│   │   └── PatternList.jsx       # Accordion cards, multiple examples
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
├── public/
│   ├── favicon.png               # Tab browser icon
│   └── slidebar.png              # Sidebar logo
│
└── supabase/
    ├── schema.sql                # Schema đầy đủ (entries, review_log, songs, song_lines, settings)
    ├── add_examples_column.sql   # Migration: thêm cột examples JSONB
    └── add_settings_table.sql    # Migration: tạo bảng settings
```

---

## Database Schema (Supabase)

### `entries`
| Cột | Type | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `type` | text | `'vocab'` hoặc `'pattern'` |
| `hanzi` | text | |
| `pinyin` | text | |
| `hv` | text | Hán-Việt |
| `meaning_vi` | text | |
| `meaning_en` | text | |
| `notes` | text | |
| `source` | text | `'douyin'` / `'music'` / `'game'` / `'manual'` |
| `examples` | jsonb | `[{hanzi, pinyin, vi}]` — thêm sau migration |
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
| Từ vựng | CRUD, search + filter type/nguồn + sort + highlight |
| Flashcard | Score-based priority (incorrect×2 - correct), shuffle sau mount |
| Lyrics | Auto-translate vietsub (Google Translate API), pinyin toggle, click-to-lookup |
| Cấu trúc | Accordion, multiple examples per pattern |
| Thống kê | Streak, 14-day chart CSS, results donut, top reviewed |
| Cài đặt | Daily goal, flashcard count, export CSV/JSON, clear log |

---

## API ngoài dùng

- **pinyin-pro** (npm) — generate pinyin server/client-side
- **Google Translate unofficial** — `translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=vi&dt=t&q=...`  
  Response: `data[0].map(seg => seg[0]).join('')`
  > Không cần key, không chính thức — dùng cho cá nhân, không thương mại.

---

## Các pattern quan trọng

- **Server Actions** thay API routes cho CRUD — `'use server'`, bind id qua `.bind(null, id)`
- **`revalidatePath('/', 'layout')`** — bắt buộc để clear Router Cache client-side
- **`useSearchParams()` cần `<Suspense>`** — bọc component dùng hook này
- **Hydration với `Math.random()`** — không shuffle trong `useState`, dùng `useEffect`
- **`export const dynamic = 'force-dynamic'`** — các trang đọc settings/realtime data
- **Context-aware back navigation** — `?back=/lyrics/[id]` truyền qua URL → redirect sau save

> Xem `PROJECT_NOTES.md` để biết các bug đã gặp và cách fix.
