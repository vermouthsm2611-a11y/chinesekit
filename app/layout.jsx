import './globals.css'
import { Inter, Noto_Sans_SC } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

// Inter — UI / Latin text (400, 500, 600)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',   // exposed as CSS variable → dùng trong design-tokens.css
  display: 'swap',
})

// Noto Sans SC — Hanzi display (400, 700)
// Full load: app cá nhân, cache sau lần đầu, không cần subset optimization
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],          // next/font tự bundle Chinese glyphs kèm
  weight: ['400', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata = {
  title: 'ChineseKit',
  description: 'Personal Chinese learning app',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }) {
  return (
    // Inject cả 2 font variables vào html để CSS variables available globally
    <html lang="vi" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>
        {/* Sidebar: chỉ hiện trên md+ */}
        <Sidebar />
        {/* Bottom nav: chỉ hiện trên mobile */}
        <BottomNav />
        {/* ml-0 mobile, ml-[260px] desktop; pb-20 mobile để tránh bottom nav */}
        <main className="ml-0 md:ml-[260px] min-h-screen p-4 md:p-6 pb-20 md:pb-6"
              style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
