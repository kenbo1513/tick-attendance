import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { initializeApp } from './lib/localStorage'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tick - 勤怠管理システム',
  description: '共有端末対応の勤怠管理システム',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // クライアントサイドでのみ実行
  if (typeof window !== 'undefined') {
    initializeApp();
  }

  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
