'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Hash, Lock, Globe, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { useAllProfiles } from '@/hooks/use-all-profiles'
import Image from 'next/image'

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
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-12 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#1d9aef] via-blue-400 to-cyan-400 tracking-tight">
            Discover Communities
          </h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">
            Find your tribe. Communities are community-led feeds where access can be gated by your on-chain reputation and holdings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-[#1d9aef] animate-spin" />
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communities.map((community: any, idx) => {
              const username = community.profile?.username || ''
              let name = username.replace('Community_', '')
              let description = 'A Tapestry community.'
              let meta: any = {}
              try {
                const parts = community.profile?.bio?.split('|||META|||')
                if (parts && parts.length > 1) {
                  description = parts[0]
                  meta = JSON.parse(parts[1])
                  if (meta.name) name = meta.name
                } else if (parts && parts.length === 1 && !parts[0].includes('isCommunity')) {
                  description = parts[0]
                }
              } catch {}

              const isRestricted = meta.gateType === 'fairscore' && meta.fairScoreGate > 0
              const image = community.profile?.image

              return (
                <Link href={`/${username}`} key={idx} className="group block">
                  <Card className="h-full bg-zinc-950/50 backdrop-blur border-zinc-800/80 hover:border-[#1d9aef]/50 transition-all duration-300 shadow-xl shadow-black hover:-translate-y-1">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center text-2xl border border-zinc-800 overflow-hidden group-hover:border-[#1d9aef]/30 transition-colors">
                            {image ? (
                              <Image src={image} alt={name} width={48} height={48} unoptimized className="object-cover w-full h-full" />
                            ) : (
                              <Hash className="h-6 w-6 text-[#1d9aef]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-1 truncate">
                              {name}
                            </h2>
                            <span className="text-sm text-zinc-500 font-medium truncate block">
                              @{username}
                            </span>
                          </div>
                        </div>
                        
                        {isRestricted ? (
                          <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 shadow-sm whitespace-nowrap">
                            {mounted && <Lock className="h-3 w-3" />} Gated
                          </div>
                        ) : (
                          <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90 shadow-sm whitespace-nowrap">
                            {mounted && <Globe className="h-3 w-3" />} Public
                          </div>
                        )}
                      </div>
                      
                      <p className="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                        {description}
                      </p>
                      
                      <div className="pt-4 border-t border-zinc-900/50 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600 uppercase tracking-widest font-semibold flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded">
                            {isRestricted ? (mounted && <Lock className="h-3 w-3 text-zinc-600" />) : (mounted && <Globe className="h-3 w-3 text-zinc-600" />)}
                            {isRestricted ? `Rep > ${meta.fairScoreGate || 0}` : 'Public'}
                          </span>
                        </div>
                        
                        <div className="p-2 rounded-full bg-zinc-900 text-zinc-400 group-hover:bg-[#1d9aef] group-hover:text-white transition-colors">
                          {mounted && <ArrowRight className="h-4 w-4" />}
                        </div>
                      </div>
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
