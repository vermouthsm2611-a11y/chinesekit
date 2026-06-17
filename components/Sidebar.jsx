'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Nav config — thêm route mới ở đây, không cần sửa component
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
      { href: '/vocab',     label: 'Từ vựng',   icon: '📖' },
      { href: '/patterns',  label: 'Cấu trúc',  icon: '🧩' },
      { href: '/sentences', label: 'Câu',        icon: '💬' },
    ],
  },
  {
    section: 'Khác',
    items: [
      { href: '/stats',    label: 'Thống kê', icon: '📊' },
      { href: '/settings', label: 'Cài đặt',  icon: '⚙️' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 h-screen w-[260px] flex-col z-40"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-3 hover:opacity-80 transition-opacity"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <img src="/slidebar.png" alt="ChineseKit" className="w-9 h-9 object-contain" />
        <span className="font-medium text-[16px]" style={{ color: 'var(--text-primary)' }}>
          ChineseKit
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-1">
            {/* Section label */}
            <p className="label-section px-5 py-1.5">{section}</p>

            {items.map(({ href, label, icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 text-[18px] transition-colors"
                  style={
                    active
                      ? {
                          // Active: pink-soft bg + pink text + pink left border
                          background: 'var(--pink-soft)',
                          color: 'var(--pink)',
                          fontWeight: 600,
                          borderLeft: '2px solid var(--pink)',
                          padding: '0.875rem 1.5rem 0.875rem calc(1.5rem - 2px)',
                        }
                      : {
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          padding: '0.875rem 1.5rem',
                        }
                  }
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-muted)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
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
