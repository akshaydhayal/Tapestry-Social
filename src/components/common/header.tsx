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
    ? (Array.isArray(profiles) ? profiles : []).filter((p: any) => p.profile?.username?.startsWith('Community_') || p.profile?.bio?.includes('"isCommunity":true')).slice(0, 4)
    : []

  return (
    <header className="hidden sm:flex flex-col w-[88px] xl:w-[230px] h-screen sticky top-0 pb-4 pt-1 px-2 xl:px-4 border-r border-[#3f3f46] bg-[#050507] justify-start shrink-0 z-50">
      <div className="flex flex-col gap-2 xl:gap-1 items-center xl:items-start w-full">
        <Link 
          href="/" 
          className="flex items-center justify-center hover:bg-zinc-900/50 transition-colors mt-6 mb-8 text-xl font-black bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent px-2"
          title="Tapestry Social"
        >
          Tapestry
        </Link>

        <nav className="flex flex-col gap-1 w-full items-center xl:items-start">
          <Link
            href="/"
            className="flex items-center gap-3 p-2.5 xl:pr-6 rounded-xl hover:bg-zinc-900/50 transition-all group w-fit xl:w-full"
          >
            {mounted && <Home className="h-5 w-5 text-zinc-400 group-hover:text-[#1d9aef] transition-colors" strokeWidth={2.5} />}
            <span className="hidden xl:inline text-[15px] font-semibold text-zinc-300 group-hover:text-white transition-colors">Home</span>
          </Link>
          
          <Link
            href="/communities"
            className="flex items-center gap-3 p-2.5 xl:pr-6 rounded-xl hover:bg-zinc-900/50 transition-all group w-fit xl:w-full"
          >
            {mounted && <Users className="h-5 w-5 text-zinc-400 group-hover:text-[#1d9aef] transition-colors" strokeWidth={2.5} />}
            <span className="hidden xl:inline text-[15px] font-semibold text-zinc-300 group-hover:text-white transition-colors">Communities</span>
          </Link>

          {mounted && mainUsername && (
            <Link
              href={`/${mainUsername}`}
              className="flex items-center gap-3 p-2.5 xl:pr-6 rounded-xl hover:bg-zinc-900/50 transition-all group w-fit xl:w-full"
            >
              <User className="h-5 w-5 text-zinc-400 group-hover:text-[#1d9aef] transition-colors" strokeWidth={2.5} />
              <span className="hidden xl:inline text-[15px] font-semibold text-zinc-300 group-hover:text-white transition-colors">Profile</span>
            </Link>
          )}
        </nav>

        {/* Popular Communities Section */}
        <div className="hidden xl:flex flex-col gap-2 mt-10 px-0 w-full">
          <h3 className="text-[11px] font-black text-zinc-500 tracking-wider uppercase px-2 mb-1">
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
                <Link href={`/${username}`} key={idx} className="group flex flex-col gap-1.5 py-2.5 px-2 rounded-xl transition-all hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {mounted && <Hash className="h-3.5 w-3.5 text-[#1d9aef] shrink-0" />}
                    <span className="text-[14px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                      {name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shadow-sm flex items-center gap-1 uppercase tracking-tighter ${isRestricted ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'}`}>
                      {isRestricted ? (mounted && <Lock className="w-2.5 h-2.5" />) : (mounted && <Globe className="w-2.5 h-2.5" />)}
                      {isRestricted ? `Rep > ${meta.fairScoreGate}` : 'Public'}
                    </span>
                  </div>
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
