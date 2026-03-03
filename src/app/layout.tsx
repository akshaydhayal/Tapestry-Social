import { Header } from '@/components/common/header'
import { RightSidebar } from '@/components/common/right-sidebar'
import { SolanaWalletProvider } from '@/components/provider/solana-provider'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tapestry Social - The On-chain Social Network',
  description:
    'A decentralized social platform and community builder powered by the Tapestry protocol on Solana.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-black text-white selection:bg-indigo-500/30`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaWalletProvider>
            <div className="flex w-full min-h-screen">
              <Header />
              <Toaster />
              <div className="flex-1 flex min-w-0">
                <main className="flex-1 w-full border-x border-[#3f3f46] pb-20 bg-black min-h-screen relative overflow-x-hidden">
                  {children}
                </main>
                <RightSidebar />
              </div>
            </div>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
