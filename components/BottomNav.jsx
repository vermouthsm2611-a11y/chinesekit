'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Bottom nav — chỉ hiện trên mobile (md:hidden)
const NAV = [
  { href: '/',         label: 'Home',     icon: '🏠' },
  { href: '/flashcard',label: 'Flashcard',icon: '🃏' },
  { href: '/vocab',    label: 'Từ vựng',  icon: '📖' },
  { href: '/lyrics',   label: 'Lyrics',   icon: '🎵' },
  { href: '/stats',    label: 'Stats',    icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100
                    flex items-center justify-around px-1 h-16 safe-area-pb">
      {NAV.map(({ href, label, icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px]
                        ${active ? 'text-[#E24B4A]' : 'text-gray-400'}`}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[12px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
