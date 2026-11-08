import { NextResponse } from 'next/server'
import { FEATURES } from './lib/features'

// Route của tính năng đang tắt -> về Dashboard (chặn trước khi render, nên không truy vấn DB)
const GATED = [
  ['/flashcard', 'flashcard'],
  ['/stats',     'flashcard'],
  ['/lyrics',    'lyrics'],
]

export function middleware(request) {
  const path = request.nextUrl.pathname
  for (const [prefix, feature] of GATED) {
    if (!FEATURES[feature] && (path === prefix || path.startsWith(prefix + '/'))) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  return NextResponse.next()
}

// Chỉ chạy middleware cho các route bị gate — route khác không tốn thêm gì
export const config = {
  matcher: ['/flashcard/:path*', '/stats/:path*', '/lyrics/:path*'],
}
