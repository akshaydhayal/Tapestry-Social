'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Hash, Lock, Globe, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAllProfiles } from '@/hooks/use-all-profiles'
import Image from 'next/image'
import { getCleanBio } from '@/utils/bio-utils'
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
    <div className="flex w-full min-h-screen bg-black">
      <main className="flex-1 w-full border-x border-[#3f3f46] pb-20 bg-black min-h-screen px-4 sm:px-6 lg:px-8">
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
              const bio = community.profile?.bio || ''
              const { meta } = extractCommunityMeta(bio)
              const name = meta?.name || username.replace('Community_', '')
              const description = getCleanBio(bio) || 'A Tapestry community.'

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
                      
                      {/* <div className="pt-3 border-t border-zinc-900/40 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 bg-zinc-950/50 px-2 py-0.5 rounded">
                            {isRestricted ? (mounted && <Lock className="h-2.5 w-2.5 text-zinc-600" />) : (mounted && <Globe className="h-2.5 w-2.5 text-zinc-600" />)}
                            {isRestricted ? `Rep > ${meta.fairScoreGate || 0}` : 'Public'}
                          </span>
                        </div>
                        
                        <div className="p-1.5 rounded-full bg-zinc-900/80 text-zinc-400 group-hover:bg-[#1d9aef] group-hover:text-white transition-colors">
                          {mounted && <ArrowRight className="h-3.5 w-3.5" />}
                        </div>
                      </div> */}
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
      </main>
    </div>
  )
}
