import { createClient } from '@supabase/supabase-js'

// Biến môi trường được Next.js inject tự động từ .env.local
// NEXT_PUBLIC_ prefix = an toàn dùng ở client-side
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local')
}

// Singleton pattern — dùng chung 1 instance toàn app
export const supabase = createClient(supabaseUrl, supabaseKey)
