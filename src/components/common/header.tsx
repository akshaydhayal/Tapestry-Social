'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
import { useProfileStore } from '@/store/profile'
import { useAllProfiles } from '@/hooks/use-all-profiles'
import { Home, Users, User, Hash, Lock, Globe } from 'lucide-react'

export function Header() {
  const { mainUsername } = useProfileStore()
  const { profiles } = useAllProfiles()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const popularCommunities = profiles
    ? profiles.filter((p: any) => p.profile?.username?.startsWith('Community_') || p.profile?.bio?.includes('"isCommunity":true')).slice(0, 4)
    : []

  return (
    <header className="hidden sm:flex flex-col w-[88px] xl:w-[275px] h-screen sticky top-0 pb-4 pt-1 px-2 xl:px-4 border-r border-zinc-900 justify-start shrink-0">
      <div className="flex flex-col gap-2 xl:gap-1 items-center xl:items-start w-full">
        <Link 
          href="/" 
          className="flex items-center justify-center hover:bg-zinc-900 transition-colors mt-4 mb-6 text-2xl font-bold font-serif"
          title="Tapestry Social"
        >
          Tapestry Social
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
            href="/communities"
            className="flex items-center gap-2 p-3 xl:pr-6 rounded-full hover:bg-zinc-900 transition-colors w-fit xl:w-auto"
          >
            {mounted && <Users className="h-6 w-6" strokeWidth={2.5} />}
            <span className="hidden xl:inline text-lg font-medium">Communities</span>
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
            {popularCommunities.length > 0 ? popularCommunities.map((community: any, idx: number) => {
              const username = community.profile?.username || ''
              let name = username.replace('Community_', '')
              let meta: any = {}
              try {
                const parts = community.profile?.bio?.split('|||META|||')
                if (parts && parts.length > 1) {
                  meta = JSON.parse(parts[1])
                  if (meta.name) name = meta.name
                }
              } catch {}

              const isRestricted = meta.gateType === 'fairscore' && meta.fairScoreGate > 0

              return (
                <Link href={`/${username}`} key={idx} className="group flex items-center justify-between py-2 px-2 rounded-xl transition-all hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                  <div className="flex flex-col max-w-[130px]">
                    <span className="text-[14px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate flex items-center gap-1.5">
                      {mounted && <Hash className="h-3 w-3 text-[#1d9aef]" />} {name}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400">@{username}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border shadow-sm flex items-center gap-1 ${isRestricted ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'}`}>
                    {isRestricted ? (mounted && <Lock className="w-2.5 h-2.5" />) : (mounted && <Globe className="w-2.5 h-2.5" />)}
                    {isRestricted ? `Rep > ${meta.fairScoreGate}` : 'Public'}
                  </span>
                </Link>
              )
            }) : (
              <div className="py-2 px-2 text-xs text-zinc-500 italic">No communities found.</div>
            )}
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
