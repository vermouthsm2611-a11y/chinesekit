'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Nav config ──────────────────────────────────────────────────────────────
// Thêm route mới ở đây, không cần sửa component
const NAV = [
  {
    section: 'Học',
    items: [
      { href: '/flashcard', label: 'Flashcard',  icon: '🃏' },
      { href: '/lyrics',    label: 'Lyrics',     icon: '🎵' },
    ],
  },
  {
    section: 'Thư viện',
    items: [
      { href: '/vocab',    label: 'Từ vựng',   icon: '📖' },
      { href: '/patterns', label: 'Cấu trúc',  icon: '🧩' },
    ],
  },
  {
    section: 'Khác',
    items: [
      { href: '/stats',    label: 'Thống kê',  icon: '📊' },
      { href: '/settings', label: 'Cài đặt',   icon: '⚙️' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] bg-white border-r border-gray-100 flex-col z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 hover:opacity-80 transition-opacity">
        <img src="/slidebar.png" alt="ChineseKit" className="w-9 h-9 object-contain" />
        <span className="font-medium text-[16px]">ChineseKit</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-1">
            <p className="px-5 py-1.5 text-[12px] uppercase tracking-wider text-gray-400 font-medium">
              {section}
            </p>
            {items.map(({ href, label, icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex items-center gap-2.5 px-5 py-2.5 text-[15px] transition-colors',
                    active
                      ? 'bg-[#FEF2F2] text-[#E24B4A] font-medium border-l-2 border-[#E24B4A] pl-[calc(1.25rem-2px)]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  ].join(' ')}
                >
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
