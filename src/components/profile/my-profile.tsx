'use client'

import { CopyPaste } from '@/components/common/copy-paste'
import { Bio } from '@/components/profile/bio'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { useState } from 'react'
import { User, Activity } from 'lucide-react'
import Image from 'next/image'
import { useFairScore } from '@/hooks/use-fairscore'

interface Props {
  username: string
}

export function MyProfile({ username }: Props) {
  const { data, refetch } = useGetProfileInfo({ username })
  const { fairScore, isLoading: isScoreLoading } = useFairScore(
    data?.walletAddress,
    data?.profile?.username,
    data?.profile?.bio
  )
  const [isEditing, setIsEditing] = useState(false)
  const { mainUsername } = useCurrentWallet()

  return (
    <div className="w-full border-b border-zinc-900 pb-4">
      {/* Banner */}
      <div className="h-24 w-full bg-gradient-to-r from-[#0c0c0e] to-[#18181b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="px-4 relative">
        {/* Overlapping Avatar */}
        <div className="absolute -top-12 left-4">
          <div className="h-24 w-24 rounded-full border-4 border-[#050507] bg-black overflow-hidden shadow-2xl relative z-10">
            {data?.profile?.image ? (
              <Image
                src={data.profile.image}
                width={96}
                height={96}
                alt="avatar"
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-[#1d9aef] flex items-center justify-center text-white">
                <User size={40} />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-3 h-14">
          {mainUsername === (data?.profile?.username || username) && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" className="rounded-full font-bold h-8 text-[12px] px-4 border border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mt-1">
          <h2 className="text-lg font-black text-white tracking-tight leading-tight">
            {data?.profile?.username || username}
          </h2>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-[13px] font-medium">@{data?.walletAddress?.slice(0, 6)}...{data?.walletAddress?.slice(-4)}</span>
            {data?.walletAddress && (
              <div className="scale-75 origin-left">
                <CopyPaste content={data.walletAddress} />
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3">
          <Bio username={username} data={data} refetch={refetch} isEditing={isEditing} setIsEditing={setIsEditing} />
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-[13px] items-center">
          <div className="hover:underline cursor-pointer flex gap-1 items-center transition-colors">
            <span className="font-bold text-white tracking-tight">{data?.socialCounts?.following || 0}</span>
            <span className="text-zinc-500 font-medium">Following</span>
          </div>
          <div className="hover:underline cursor-pointer flex gap-1 items-center transition-colors">
            <span className="font-bold text-white tracking-tight">{data?.socialCounts?.followers || 0}</span>
            <span className="text-zinc-500 font-medium">Followers</span>
          </div>
          {fairScore !== null && (
            <div className="flex gap-1.5 items-center px-2.5 py-1 bg-[#1d9aef]/5 text-[#1d9aef] rounded-lg text-[11px] font-black uppercase tracking-wider border border-[#1d9aef]/10 shadow-sm transition-all hover:bg-[#1d9aef]/10">
              <Activity size={12} className="animate-pulse" />
              <span>{isScoreLoading ? '...' : fairScore} Reputation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
