import type { Metadata } from 'next'
import { Inter, Outfit, Cinzel } from 'next/font/google' // Assuming generic google fonts import works or will be defaulted
import './globals.css'
import { FloatingDock } from '@/components/FloatingDock'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' })

export const metadata: Metadata = {
  title: '幻想シアター TA記録帳',
  description: '幻想シアターのタイムアタック記録・統計',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${cinzel.variable} font-sans min-h-screen selection:bg-purple-500/30`}>
        <div className="mesh-bg" />
        <main className="relative z-10 pb-32">
          {children}
        </main>
        <FloatingDock />
      </body>
    </html>
  )
}
