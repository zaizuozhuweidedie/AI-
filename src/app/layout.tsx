import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CardWise - AI 学习助手',
  description: '用 AI 生成 Flashcards，间隔重复算法科学记忆',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
