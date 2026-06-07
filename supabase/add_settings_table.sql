-- Migration: bảng settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Giá trị mặc định
INSERT INTO settings (key, value) VALUES
  ('daily_goal',         '20'),
  ('flashcard_count',    '20'),
  ('lyrics_show_pinyin', 'false')
ON CONFLICT (key) DO NOTHING;
