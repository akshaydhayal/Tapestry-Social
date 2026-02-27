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
      <div className="h-32 w-full bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Profile Info */}
      <div className="px-4 relative">
        {/* Overlapping Avatar */}
        <div className="absolute -top-16 left-4">
          <div className="h-32 w-32 rounded-full border-4 border-black bg-black overflow-hidden ring-0">
            {data?.profile?.image ? (
              <Image
                src={data.profile.image}
                width={128}
                height={128}
                alt="avatar"
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-indigo-500 flex items-center justify-center text-white">
                <User size={64} />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit Profile, etc. if needed later) */}
        <div className="flex justify-end pt-3 h-16">
          {mainUsername === (data?.profile?.username || username) && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="secondary" className="rounded-full font-medium h-9">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Name & Username */}
        <div className="mt-2">
          <h2 className="text-xl font-black text-white leading-tight">
            {data?.profile?.username || username}
          </h2>
          <div className="flex items-center gap-1 text-zinc-500">
            <span className="text-[15px]">@{data?.walletAddress?.slice(0, 8)}...{data?.walletAddress?.slice(-4)}</span>
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

        {/* Stats */}
        <div className="mt-3 flex flex-wrap gap-5 text-[15px] items-center">
          <div className="hover:underline cursor-pointer flex gap-1 items-center">
            <span className="font-bold text-white">{data?.socialCounts?.following || 0}</span>
            <span className="text-zinc-500">Following</span>
          </div>
          <div className="hover:underline cursor-pointer flex gap-1 items-center">
            <span className="font-bold text-white">{data?.socialCounts?.followers || 0}</span>
            <span className="text-zinc-500">Followers</span>
          </div>
          {fairScore !== null && (
            <div className="flex gap-1.5 items-center px-2 py-0.5 bg-[#1d9aef]/10 text-[#1d9aef] rounded-full text-sm font-semibold border border-[#1d9aef]/20">
              <Activity size={14} className="animate-pulse" />
              <span>{isScoreLoading ? '...' : fairScore} FairScore</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
