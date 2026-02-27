'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Hash, Lock, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'

const SUBNETS = [
  {
    name: 'SolanaDevs',
    description: 'The premier place for Solana builders, rustaceans, and anchor developers to share alpha and get help.',
    members: 1245,
    gate: 'FairScore > 100',
    type: 'restricted',
    icon: '💻'
  },
  {
    name: 'DeFiDegens',
    description: 'Yield farming, impermanent loss discussions, and the latest SPL token drops. Not financial advice.',
    members: 8932,
    gate: 'Public',
    type: 'public',
    icon: '💸'
  },
  {
    name: 'NFTWhales',
    description: 'Exclusive club for verifiable holders of top Solana NFT collections.',
    members: 432,
    gate: 'FairScore > 500',
    type: 'restricted',
    icon: '🐋'
  },
  {
    name: 'MemeTrench',
    description: 'Surviving the trenches. Daily token launches and rugpull survivor stories.',
    members: 14200,
    gate: 'Public',
    type: 'public',
    icon: '🐸'
  }
]

export default function SubnetsDirectory() {
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-12 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight">
            Discover Communities
          </h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">
            Find your tribe. Communities are community-led feeds where access can be gated by your on-chain reputation and holdings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUBNETS.map((subnet) => (
            <Link href={`/r/${subnet.name}`} key={subnet.name} className="group block">
              <Card className="h-full bg-zinc-950/50 backdrop-blur border-zinc-800/80 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black hover:-translate-y-1">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-2xl border border-zinc-800 group-hover:bg-purple-900/20 group-hover:border-purple-500/30 transition-colors">
                        {subnet.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-1">
                          {mounted && <Hash className="h-4 w-4 text-purple-400" />}
                          {subnet.name}
                        </h2>
                        <span className="text-sm text-zinc-500 font-medium">
                          {subnet.members.toLocaleString()} members
                        </span>
                      </div>
                    </div>
                    
                    {subnet.type === 'restricted' ? (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400/90 shadow-sm">
                        {mounted && <Lock className="h-3 w-3" />} Gated
                      </div>
                    ) : (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90 shadow-sm">
                        {mounted && <Globe className="h-3 w-3" />} Public
                      </div>
                    )}
                  </div>
                  
                  <p className="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">
                    {subnet.description}
                  </p>
                  
                  <div className="pt-4 border-t border-zinc-900/50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600 uppercase tracking-widest font-semibold flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded">
                        {subnet.type === 'restricted' ? (mounted && <Lock className="h-3 w-3 text-zinc-600" />) : (mounted && <Globe className="h-3 w-3 text-zinc-600" />)}
                        {subnet.gate}
                      </span>
                    </div>
                    
                    <div className="p-2 rounded-full bg-zinc-900 text-zinc-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      {mounted && <ArrowRight className="h-4 w-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
