// Bật/tắt tính năng — code + DB vẫn giữ nguyên, chỉ ẩn khỏi UI và chặn route (xem middleware.js).
// Ẩn 2026-11-06: app chủ yếu dùng để LƯU từ vựng / câu / cấu trúc; flashcard + lyrics không dùng.
export const FEATURES = {
  flashcard: false,   // gồm: /flashcard, /stats (toàn bộ là dữ liệu ôn tập), phần ôn tập trên Dashboard + Settings
  lyrics:    false,   // gồm: /lyrics/*, widget Bài hát trên Dashboard, cài đặt pinyin lyrics
}
