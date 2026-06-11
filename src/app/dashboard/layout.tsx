import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav user={session.user} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
