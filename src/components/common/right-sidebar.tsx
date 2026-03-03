'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WhoToFollow } from '@/components/feed/who-to-follow'
import { useRouter } from 'next/navigation'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useProfileStore } from '@/store/profile'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { Button } from './button'
import { User, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { useFairScore } from '@/hooks/use-fairscore'

export function RightSidebar() {
  const { walletAddress } = useCurrentWallet()
  const { mainUsername, profileImage, setProfileData } = useProfileStore()
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const { profiles } = useGetProfiles({
    walletAddress: walletAddress || '',
  })
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)
  
  const currentProfileList = profiles && profiles.length > 0 ? profiles[0] : null
  const { fairScore, isLoading: isScoreLoading } = useFairScore(
    currentProfileList?.wallet?.address,
    currentProfileList?.profile?.username,
    currentProfileList?.profile?.bio
  )
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profiles && profiles.length) {
      setProfileData(profiles[0].profile.username, profiles[0].profile.image || null)
    }

    if (isProfileCreated && profileUsername) {
      setProfileData(profileUsername, null)
      setIsProfileCreated(false)
      setProfileUsername(null)
    }
  }, [profiles, isProfileCreated, profileUsername, setProfileData])

  return (
    <aside className="hidden lg:block w-[355px] pl-6 pt-2 h-screen sticky top-0 border-l border-[#3f3f46] bg-[#050507]">
      
      {/* Profile & Wallet Header */}
      <div className="sticky top-0 bg-transparent pt-4 pb-6 z-10 w-full mb-0 flex items-center gap-2 px-2">
        {mounted && connected && (
          <div className="flex-shrink-0">
            {mainUsername ? (
              <Button
                variant="ghost"
                onClick={() => router.push(`/${mainUsername}`)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-zinc-900/50 transition-colors h-10"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    width={32}
                    height={32}
                    alt="avatar"
                    className="object-cover rounded-full min-w-[32px] h-[32px]"
                    unoptimized
                  />
                ) : (
                  <div className="min-w-[32px] h-[32px] bg-[#1d9aef] rounded-full flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                )}
                <div className="flex flex-col items-start min-w-0 max-w-[70px]">
                  <span className="font-bold text-[11px] truncate w-full text-white">{mainUsername}</span>
                </div>
              </Button>
            ) : (
              <div className="flex items-center h-10 px-2">
                <CreateProfileContainer
                  setIsProfileCreated={setIsProfileCreated}
                  setProfileUsername={setProfileUsername}
                />
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          {mounted && (
            <WalletMultiButton className="!bg-[#1d9aef] hover:!bg-[#1a8cd8] !shadow-[0_0_15px_rgba(29,154,239,0.3)] transition-all !w-full !rounded-xl !h-10 flex justify-center !text-[12px] font-bold truncate !border-none" />
          )}
        </div>
      </div>

      {/* Polished Reputation Card */}
      <div className="bg-[#0c0c0e] border border-slate-500 rounded-2xl pt-5 pb-2 mb-4 w-full overflow-hidden shadow-2xl relative">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1d9aef]/5 blur-[60px] rounded-full"></div>
        
        <div className="px-5 relative z-10 border-b border-slate-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-[12px] text-slate-200 uppercase tracking-[0.2em]">Wallet Reputation Score</h3>
            <ShieldCheck className="h-3.5 w-3.5 text-slate-300" />
          </div>
          
          {mounted && connected ? (
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] leading-none">
                    {isScoreLoading ? '...' : (fairScore !== null ? fairScore : '0')}
                  </span>
                  <div className="flex flex-col -translate-y-0.5">
                    <span className="text-[#1d9aef] text-[10px] font-black tracking-widest uppercase inline-block">FairScore</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] py-3 rounded-xl">
                <p className="text-[11px] leading-relaxed text-zinc-400 font-medium font-inter">
                   On-chain reputation determines your access to premium communities.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-zinc-500 font-medium py-4 flex flex-col items-center gap-3 text-center border border-dashed border-zinc-800/50 rounded-xl">
              <User className="h-6 w-6 text-zinc-800" />
              <span className="px-4">Connect wallet to view your reputation.</span>
            </div>
          )}
        </div>
        
        <div className="h-px bg-white/5 w-full mb-0"></div>
        
        <div className="scale-[0.98] origin-top">
          {mounted && <WhoToFollow />}
        </div>
      </div>
      
    </aside>
  )
}
