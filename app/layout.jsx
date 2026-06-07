import './globals.css'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

export const metadata = {
  title: 'ChineseKit',
  description: 'Personal Chinese learning app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {/* Sidebar: chỉ hiện trên md+ */}
        <Sidebar />
        {/* Bottom nav: chỉ hiện trên mobile */}
        <BottomNav />
        {/* ml-0 mobile, ml-[220px] desktop; pb-16 mobile để tránh bottom nav */}
        <main className="ml-0 md:ml-[220px] min-h-screen bg-[#F7F7F5] p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  )
}
