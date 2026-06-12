import Link from 'next/link'
import type { User } from 'next-auth'

export default function DashboardNav({ user }: { user: Partial<User> }) {
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gray-900 flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="text-lg font-bold text-gray-900">CardWise</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.name || user.email}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-400 hover:text-gray-700 transition"
          >
            退出
          </Link>
        </div>
      </div>
    </nav>
  )
}
