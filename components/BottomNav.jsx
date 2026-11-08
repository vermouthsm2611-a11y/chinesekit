'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconBook, IconLayers, IconChat, IconSettings } from '@/components/ui/Icons'

// Bottom nav — chỉ hiện trên mobile (md:hidden).
// 2026-11-06: flashcard / lyrics / stats ẩn (lib/features.js) -> khớp Sidebar. Bản cũ:
// Home, Flashcard(/flashcard), Từ vựng, Lyrics(/lyrics), Stats(/stats) — icon IconCards/IconMusic/IconBarChart.
const NAV = [
  { href: '/',          label: 'Home',     icon: IconHome },
  { href: '/vocab',     label: 'Từ vựng',  icon: IconBook },
  { href: '/patterns',  label: 'Cấu trúc', icon: IconLayers },
  { href: '/sentences', label: 'Câu',      icon: IconChat },
  { href: '/settings',  label: 'Cài đặt',  icon: IconSettings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        height: '56px',          // WCAG AA minimum touch target height
      }}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{
              // min 44×44px touch target (WCAG AA)
              minWidth: '44px',
              minHeight: '44px',
              padding: '6px 8px',
              // Active: pink top border indicator + pink text
              borderTop: active ? '2px solid var(--primary)' : '2px solid transparent',
              color: active ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <Icon size={20} />
            <span className="text-[13px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
