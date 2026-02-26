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
import { User } from 'lucide-react'
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
  const { connected, publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)
  
  const currentProfileList = profiles && profiles.length > 0 ? profiles[0] : null
  const { fairScore, isLoading: isScoreLoading } = useFairScore(currentProfileList)
  
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
    <aside className="hidden lg:block w-[350px] pl-8 pt-2 h-screen sticky top-0">
      
      {/* Profile & Wallet Header */}
      <div className="sticky top-0 bg-black pt-1 pb-3 z-10 w-full mb-6 flex items-center gap-2">
        {mounted && connected && (
          <div className="flex-shrink-0">
            {mainUsername ? (
              <Button
                variant="ghost"
                onClick={() => router.push(`/${mainUsername}`)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-zinc-900 transition-colors h-12"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    width={36}
                    height={36}
                    alt="avatar"
                    className="object-cover rounded-full min-w-[36px] h-[36px]"
                    unoptimized
                  />
                ) : (
                  <div className="min-w-[36px] h-[36px] bg-indigo-500 rounded-full flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                )}
                <div className="flex flex-col items-start min-w-0 max-w-[80px]">
                  <span className="font-bold text-xs truncate w-full text-white">{mainUsername}</span>
                </div>
              </Button>
            ) : (
              <div className="flex items-center h-12 px-2">
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
            <WalletMultiButton className="!bg-[#1d9aef] hover:!bg-[#1a8cd8] transition-colors !w-full !rounded-full !h-12 flex justify-center text-sm font-bold truncate" />
          )}
        </div>
      </div>

      {/* Combined Reputation & Who to Follow Card */}
      <div className="bg-[#16181c] border border-zinc-900 rounded-2xl pt-4 pb-2 mb-4 w-full overflow-hidden">
        <div className="px-4 mb-4">
          <h3 className="font-extrabold text-xl text-white mb-2">Your Reputation</h3>
          {mounted && connected ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white">
                  {isScoreLoading ? '...' : (fairScore !== null ? fairScore : '0')}
                </span>
                <span className="text-zinc-500 mb-1 font-medium">FairScore</span>
              </div>
              <p className="text-[13px] leading-tight text-zinc-400">Top active Solana wallets. Access granted to gated subnets!</p>
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-[#1d9aef] rounded-full relative transition-all duration-1000 ease-out" 
                  style={{ width: `${isScoreLoading ? 0 : scorePercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              {mounted ? "Connect to calculate your FairScale score." : "Loading reputation..."}
            </div>
          )}
        </div>
        
        <div className="h-px bg-zinc-900 w-full my-2"></div>
        
        {mounted && <WhoToFollow />}
      </div>
      
    </aside>
  )
}
