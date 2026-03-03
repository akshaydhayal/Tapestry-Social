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

  // Calculate percentage for progress bar (cap at 100%, assuming 1000 is a high score)
  const scorePercentage = fairScore !== null ? Math.min(100, Math.max(0, (fairScore / 1000) * 100)) : 0

  return (
    <aside className="hidden lg:block w-[350px] pl-6 pt-2 h-screen sticky top-0 border-l border-[#3f3f46] bg-[#050507]">
      
      {/* Profile & Wallet Header */}
      <div className="sticky top-0 bg-transparent pt-4 pb-6 z-10 w-full mb-2 flex items-center gap-2 px-2">
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

      {/* Combined Reputation & Who to Follow Card */}
      <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-2xl pt-5 pb-2 mb-4 w-full overflow-hidden shadow-2xl">
        <div className="px-5 mb-5">
          <h3 className="font-black text-xs text-zinc-500 uppercase tracking-widest mb-4">Your Reputation</h3>
          {mounted && connected ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                  {isScoreLoading ? '...' : (fairScore !== null ? fairScore : '0')}
                </span>
                <span className="text-zinc-500 text-xs font-bold tracking-tight uppercase">FairScore</span>
              </div>
              <div className="flex items-center gap-3 mt-4 mb-4 bg-black/40 border border-zinc-800/50 p-2.5 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-[#1d9aef]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#1d9aef] h-5 w-5" />
                </div>
                <p className="text-[11px] leading-tight text-zinc-400 font-medium font-inter">Verified on-chain activity. Access to premium subnets granted.</p>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mt-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#1d9aef] to-cyan-400 rounded-full relative transition-all duration-1000 ease-out" 
                  style={{ width: `${isScoreLoading ? 0 : scorePercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-zinc-500 font-medium py-2">
              {mounted ? "Connect wallet to verify reputation." : "Initializing..."}
            </div>
          )}
        </div>
        
        <div className="h-px bg-zinc-800/40 w-full mb-2"></div>
        
        <div className="scale-[0.98] origin-top">
          {mounted && <WhoToFollow />}
        </div>
      </div>
      
    </aside>
  )
}
