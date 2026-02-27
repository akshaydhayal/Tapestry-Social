import { Header } from '@/components/common/header'
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
            <div className="flex justify-center w-full min-h-screen">
               <div className="w-full max-w-[1265px] flex justify-between">
                 <Header />
                 <Toaster />
                 <div className="flex-1 flex max-w-[990px]">{children}</div>
               </div>
            </div>
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
