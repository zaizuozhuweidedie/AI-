'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: '📊' },
  { href: '/dashboard/decks', label: '我的卡组', icon: '📚' },
  { href: '/dashboard/study', label: '开始学习', icon: '🧠' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-white/10 p-4 hidden md:block">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition',
              pathname === item.href
                ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
