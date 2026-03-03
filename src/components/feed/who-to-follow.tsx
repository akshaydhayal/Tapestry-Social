'use client'

import { useSuggestedGlobal } from '@/components/suggested-and-creators-invite/hooks/use-suggested-global'
import { useAllProfiles } from '@/hooks/use-all-profiles'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { FollowButton } from '@/components/profile/follow-button'
import { User, Loader2 } from 'lucide-react'
import { useFollowEvent } from '@/hooks/use-follow-event'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function WhoToFollow() {
  const { walletAddress, mainUsername } = useCurrentWallet()
  const { profiles: suggestedProfiles, loading: loadingSuggested, getSuggestedGlobal } = useSuggestedGlobal()
  const { profiles: allProfiles, loading: loadingAll } = useAllProfiles()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (walletAddress) {
      getSuggestedGlobal(walletAddress)
    }
  }, [walletAddress, getSuggestedGlobal])

  useFollowEvent(() => {
    if (walletAddress) getSuggestedGlobal(walletAddress)
  })

  // Filter out communities and current user
  const filterValidUsers = (list: any[]) => {
    if (!list || !Array.isArray(list)) return []
    return list.filter(item => {
      const profile = item.profile || (item.profiles && item.profiles[0]?.profile) || item;
      const un = profile.username || '';
      const bio = profile.bio || '';
      if (!un || un === 'Anonymous') return false;
      if (un === mainUsername) return false;
      if (un.startsWith('Community_')) return false;
      if (bio.includes('"isCommunity":true')) return false;
      return true;
    })
  }

  // Combine or fallback logic
  const displayProfiles = (suggestedProfiles && Array.isArray(suggestedProfiles) && suggestedProfiles.length > 0)
    ? filterValidUsers(suggestedProfiles).slice(0, 5)
    : (allProfiles && Array.isArray(allProfiles))
      ? filterValidUsers(allProfiles).slice(0, 5)
      : []

  const isLoading = loadingSuggested || loadingAll

  if (!mounted) return null

  return (
    <div className="pt-4 mt-2 px-5 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-black text-[11px] text-zinc-500 uppercase tracking-widest px-0">
          {suggestedProfiles && suggestedProfiles.length > 0 ? (
            <>Suggested People</>
          ) : (
            <>Discover People</>
          )}
        </h3>
      </div>

      {!walletAddress && (
        <p className="text-sm text-zinc-500 italic mb-4">Connect your wallet to see personalized suggestions.</p>
      )}

      <div className="flex flex-col gap-4">
        {displayProfiles.map((item: any, index: number) => {
          // Normalizing the profile data between different hook/API formats
          // 1. Suggested profile format: item.profile
          // 2. Identity format: item.profiles[0].profile
          // 3. Search result format: item.profile
          // 4. Fallback: item itself
          const profile = item.profile || (item.profiles && item.profiles[0]?.profile) || item;
          
          const username = profile.username || 'Anonymous';
          const image = profile.image;
          // Namespace can be in various places
          const namespace = item.namespace?.name || profile.namespace || (item.profiles && item.profiles[0]?.namespace?.name) || 'User';

          if (!username || username === 'Anonymous') return null;

          return (
            <div key={index} className="flex items-center justify-between gap-2 py-1.5 group/item transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {image ? (
                  <div className="relative">
                    <Image
                      src={image}
                      width={32}
                      height={32}
                      alt={username}
                      className="rounded-full object-cover min-w-[32px] h-[32px] border border-white/5 shadow-md"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="min-w-[32px] h-[32px] rounded-full bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-zinc-500">
                    <User size={16} />
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <p className="font-bold text-[13px] text-white truncate leading-tight">
                    {username}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate font-inter font-semibold uppercase tracking-tighter mt-0.5">
                    {namespace}
                  </p>
                </div>
              </div>
              <FollowButton username={username} />
            </div>
          )
        })}

        {isLoading && displayProfiles.length === 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
          </div>
        )}

        {!isLoading && displayProfiles.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-2">No users found yet.</p>
        )}
      </div>
    </div>
  )
}
