'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Hash, Lock, Globe, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAllProfiles } from '@/hooks/use-all-profiles'
import Image from 'next/image'
import { getCommunityDescription } from '@/utils/bio-utils'
import { extractCommunityMeta } from '@/utils/community-meta'


export default function CommunitiesDirectory() {
  useWallet()
  const { profiles, loading } = useAllProfiles()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const communities = profiles
    ? profiles.filter((p: any) => p.profile?.username?.startsWith('Community_') || p.profile?.bio?.includes('"isCommunity":true'))
    : []

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center mt-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#1d9aef] via-blue-400 to-cyan-400 tracking-tight">
            Discover Communities
          </h1>
          <p className="text-sm font-medium text-zinc-400 mt-1 max-w-2xl mx-auto">
            Find your tribe. Communities are community-led feeds where access can be gated by your on-chain reputation and holdings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-[#1d9aef] animate-spin" />
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto ">
            {communities.map((community: any, idx) => {
              const username = community.profile?.username || ''
              const { meta } = extractCommunityMeta(community.profile?.bio)
              const name = meta?.name || username.replace('Community_', '')
              const description = getCommunityDescription(community.profile?.bio, meta)

              const isRestricted = meta?.gateType === 'fairscore' && meta?.fairScoreGate && meta.fairScoreGate > 0
              const image = community.profile?.image

              return (
                <Link href={`/${username}`} key={idx} className="group block">
                  <Card className="h-full bg-zinc-950/40 backdrop-blur-md border-slate-500 p-0 hover:border-slate-400 transition-all duration-300 shadow-2xl shadow-black hover:-translate-y-1">
                    <CardContent className="px-4 py-2 h-full flex flex-col border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-zinc-900/80 flex items-center justify-center text-xl border border-zinc-800/50 overflow-hidden group-hover:border-[#1d9aef]/30 transition-colors">
                            {image ? (
                              <Image src={image} alt={name} width={40} height={40} unoptimized className="object-cover w-full h-full" />
                            ) : (
                              <Hash className="h-5 w-5 text-[#1d9aef]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-[17px] font-bold text-zinc-100 flex items-center gap-1 truncate">
                              {name}
                            </h2>
                            <span className="text-[13px] text-zinc-500 font-medium truncate block">
                              @{username}
                            </span>
                          </div>
                        </div>
                        
                        {isRestricted ? (
                          <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 shadow-sm whitespace-nowrap">
                            {mounted && <Lock className="h-3 w-3" />} Gated
                          </div>
                        ) : (
                          <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90 shadow-sm whitespace-nowrap">
                            {mounted && <Globe className="h-3 w-3" />} Public
                          </div>
                        )}
                      </div>
                      
                      <p className="text-zinc-400 text-[13px] mb-4 flex-grow leading-relaxed line-clamp-2">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No communities have been created yet. Be the first!
          </div>
        )}
      </div>
    </>
  )
}
