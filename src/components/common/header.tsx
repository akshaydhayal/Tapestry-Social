'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
import { useProfileStore } from '@/store/profile'
import { Home, RefreshCw, User } from 'lucide-react'

export function Header() {
  const { mainUsername } = useProfileStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <header className="hidden sm:flex flex-col w-[88px] xl:w-[275px] h-screen sticky top-0 pb-4 pt-1 px-2 xl:px-4 border-r border-zinc-900 justify-start shrink-0">
      <div className="flex flex-col gap-2 xl:gap-1 items-center xl:items-start w-full">
        <Link 
          href="/" 
          // className="border border-red-400 w-14 h-14 xl:w-16 xl:h-16 flex items-center justify-center rounded-full hover:bg-zinc-900 transition-colors mb-2 text-3xl font-bold font-serif"
          className="flex items-center justify-center hover:bg-zinc-900 transition-colors mt-4 mb-6 text-2xl font-bold font-serif"
          title="Tapestry"
        >
          Tapestry Reddit
        </Link>

        <nav className="flex flex-col gap-1 w-full items-center xl:items-start">
          <Link
            href="/"
            className="flex items-center gap-2 p-3 xl:pr-6 rounded-full hover:bg-zinc-900 transition-colors w-fit xl:w-auto"
          >
            {mounted && <Home className="h-6 w-6" strokeWidth={2.5} />}
            <span className="hidden xl:inline text-lg font-medium">Home</span>
          </Link>
          
          <Link
            href="/subnets"
            className="flex items-center gap-2 p-3 xl:pr-6 rounded-full hover:bg-zinc-900 transition-colors w-fit xl:w-auto"
          >
            {mounted && <RefreshCw className="h-6 w-6" strokeWidth={2.5} />}
            <span className="hidden xl:inline text-lg font-medium">Explore</span>
          </Link>

          {mounted && mainUsername && (
            <Link
              href={`/${mainUsername}`}
              className="flex items-center gap-2 p-3 xl:pr-6 rounded-full hover:bg-zinc-900 transition-colors w-fit xl:w-auto"
            >
              <User className="h-6 w-6" strokeWidth={2.5} />
              <span className="hidden xl:inline text-lg font-medium">Profile</span>
            </Link>
          )}
        </nav>

        {/* Popular Communities Section */}
        <div className="hidden xl:flex flex-col gap-2 mt-8 px-2 w-full">
          <h3 className="text-[13px] font-black text-zinc-500 tracking-widest uppercase px-1">
            Popular Communities
          </h3>
          <div className="flex flex-col gap-1">
            <Link href="/subnets" className=" group flex items-center justify-between py-1 px-1 rounded-xl transition-all hover:bg-zinc-900">
              <span className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors">#SolanaDevs</span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">Rep &gt; 100</span>
            </Link>
            <Link href="/subnets" className=" group flex items-center justify-between py-1 px-1 rounded-xl transition-all hover:bg-zinc-900">
              <span className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors">#DeFiDegens</span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">Public</span>
            </Link>
            <Link href="/subnets" className="group flex items-center justify-between py-1 px-1 rounded-xl transition-all hover:bg-zinc-900">
              <span className="text-[15px] font-bold text-zinc-100 group-hover:text-white transition-colors">#NFTWhales</span>
              <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">NFT Req</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center xl:items-start gap-4 mb-2 mt-12 relative w-full">
         <div className="hidden xl:block ml-2 w-full">
            <DialectNotificationComponent />
         </div>
      </div>
    </header>
  )
}
