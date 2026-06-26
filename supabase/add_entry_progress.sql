-- Migration: Leitner 3-bucket SRS
-- Chạy file này trong Supabase SQL Editor

CREATE TABLE IF NOT EXISTS entry_progress (
  -- 1 entry = 1 row duy nhất, upsert thay vì insert mới
  entry_id     uuid PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,

  -- Bucket 1 = học hàng ngày, 2 = mỗi 3 ngày, 3 = mỗi 7 ngày
  bucket       int  NOT NULL DEFAULT 1 CHECK (bucket BETWEEN 1 AND 3),

  -- Ngày tiếp theo cần ôn (so sánh với CURRENT_DATE phía app)
  next_review  date NOT NULL DEFAULT CURRENT_DATE
);

-- Index để query "due today" nhanh
CREATE INDEX IF NOT EXISTS idx_entry_progress_next_review
  ON entry_progress (next_review);
