'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Bottom nav — chỉ hiện trên mobile (md:hidden)
const NAV = [
  { href: '/',          label: 'Home',     icon: '🏠' },
  { href: '/flashcard', label: 'Flashcard', icon: '🃏' },
  { href: '/vocab',     label: 'Từ vựng',  icon: '📖' },
  { href: '/lyrics',    label: 'Lyrics',   icon: '🎵' },
  { href: '/stats',     label: 'Stats',    icon: '📊' },
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
      {NAV.map(({ href, label, icon }) => {
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
              borderTop: active ? '2px solid var(--pink)' : '2px solid transparent',
              color: active ? 'var(--pink)' : 'var(--text-muted)',
            }}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[13px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
