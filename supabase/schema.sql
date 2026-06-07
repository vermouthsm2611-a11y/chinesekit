-- ============================================================
-- ChineseKit — Supabase Schema
-- Paste toàn bộ file này vào SQL Editor trên supabase.com
-- ============================================================

-- Bảng chính: từ vựng + cấu trúc (phân biệt bằng cột `type`)
CREATE TABLE entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL DEFAULT 'vocab'
              CHECK (type IN ('vocab', 'pattern')),
  hanzi       TEXT NOT NULL,
  pinyin      TEXT,
  hv          TEXT,                    -- Hán-Việt, ví dụ: "Hối"
  meaning_vi  TEXT NOT NULL,           -- nghĩa tiếng Việt
  meaning_en  TEXT,                    -- nghĩa tiếng Anh (optional)
  example     TEXT,                    -- câu ví dụ tiếng Trung
  example_vi  TEXT,                    -- dịch câu ví dụ
  notes       TEXT,                    -- ghi chú thêm
  source      TEXT DEFAULT 'manual'
              CHECK (source IN ('douyin', 'music', 'game', 'manual')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tự động cập nhật updated_at khi sửa entry
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tags (nhãn tùy chỉnh, tách biệt với source)
CREATE TABLE tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#E24B4A'  -- hex color cho badge
);

-- Quan hệ nhiều-nhiều: entry <-> tag
CREATE TABLE entry_tags (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- Bài hát
CREATE TABLE songs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  artist      TEXT,
  youtube_url TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Từng dòng lyrics của bài hát
CREATE TABLE song_lines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id        UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  line_order     INT  NOT NULL,         -- thứ tự dòng trong bài
  hanzi          TEXT NOT NULL,
  pinyin         TEXT,
  vietsub        TEXT,
  -- mảng UUID các entries được link với dòng này (click-to-lookup)
  linked_entries UUID[] DEFAULT '{}'
);

-- Log ôn tập (dùng cho SRS sau này)
CREATE TABLE review_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  result      TEXT NOT NULL
              CHECK (result IN ('correct', 'incorrect', 'skip')),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes — tăng tốc query phổ biến
-- ============================================================
CREATE INDEX idx_entries_type      ON entries (type);
CREATE INDEX idx_entries_source    ON entries (source);
CREATE INDEX idx_entries_created   ON entries (created_at DESC);
CREATE INDEX idx_song_lines_song   ON song_lines (song_id, line_order);
CREATE INDEX idx_review_log_entry  ON review_log (entry_id, reviewed_at DESC);

-- Full-text search cho hanzi + meaning_vi
CREATE INDEX idx_entries_search ON entries
  USING GIN (to_tsvector('simple', hanzi || ' ' || meaning_vi));

-- ============================================================
-- Seed data mẫu để test UI
-- ============================================================
INSERT INTO entries (type, hanzi, pinyin, hv, meaning_vi, source) VALUES
  ('vocab',   '后悔',    'hòuhuǐ',   'Hối',    'hối tiếc',                    'manual'),
  ('vocab',   '温柔',    'wēnróu',   NULL,     'dịu dàng',                    'music'),
  ('vocab',   '犯错',    'fàncuò',   NULL,     'mắc lỗi',                     'douyin'),
  ('vocab',   '勇敢',    'yǒnggǎn',  NULL,     'dũng cảm, can đảm',           'manual'),
  ('pattern', '难道...吗', 'nándào...ma', NULL, 'chẳng lẽ... sao? (câu hỏi tu từ)', 'music'),
  ('pattern', '动词 + 不了', NULL,   NULL,     'không thể làm được',          'manual');
