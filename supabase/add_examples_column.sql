-- Migration: thêm cột examples (jsonb) cho entries
-- Chạy trong Supabase SQL Editor
-- Mỗi item: { "hanzi": "...", "pinyin": "...", "vi": "..." }

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS examples jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migrate data cũ: nếu example không trống thì chuyển vào examples array
UPDATE entries
SET examples = jsonb_build_array(
  jsonb_build_object(
    'hanzi',  COALESCE(example, ''),
    'pinyin', '',
    'vi',     COALESCE(example_vi, '')
  )
)
WHERE (example IS NOT NULL AND example != '')
  AND examples = '[]'::jsonb;
