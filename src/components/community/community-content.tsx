'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { extractCommunityMeta } from '@/utils/community-meta'
import { Hash, Lock, Globe, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ChatMessage, CommunityChat } from './community-chat'
import { useGetFollowersState } from '@/components/profile/hooks/use-get-follower-state'
import { useFollowUser } from '@/components/profile/hooks/use-follow-user'
import { useFairScore } from '@/hooks/use-fairscore'
import { Button } from '@/components/common/button'

interface Props {
  communityProfile: any // Raw profile item from the API
}

export function CommunityContent({ communityProfile }: Props) {
  const { walletAddress, mainUsername } = useCurrentWallet()
  const { publicKey } = useWallet()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  
  // Parse Meta
  const bio = communityProfile?.profile?.bio || ''
  const { cleanBio, meta } = extractCommunityMeta(bio)
  const username = communityProfile.profile.username
  const name = meta?.name || username.replace('Community_', '')
  const isGated = meta?.gateType === 'fairscore' && meta?.fairScoreGate && meta.fairScoreGate > 0
  const gateScore = meta?.fairScoreGate || 0
  const image = communityProfile.profile.image

  // Membership & Score validation
  const { fairScore, isLoading: scoreLoading } = useFairScore(walletAddress, mainUsername, '')
  const { data: followState, loading: stateLoading, refetch: refetchState } = useGetFollowersState({
    followerUsername: mainUsername || '',
    followeeUsername: username
  })
  const { followUser, loading: followLoading } = useFollowUser()
  const [joinError, setJoinError] = useState('')

  const isJoined = followState?.isFollowing || walletAddress === communityProfile.wallet?.address
  const canView = !isGated || isJoined
  const canPost = isJoined

  // Fetch posts filtered by subnet metadata matching this group
  const fetchMessages = useCallback(async () => {
    if (!canView) return
    setIsLoadingMessages(true)
    try {
      const res = await fetch(`/api/contents/feed?t=${Date.now()}`)
      const data = await res.json()
      if (data && data.contents) {
        const msgs: ChatMessage[] = data.contents
          .filter((item: any) => {
             // Look for subnet in TAPESTRY_META
             const contentText = item.content.text || ''
             if (contentText.includes('|TAPESTRY_META|')) {
               const parts = contentText.split('|TAPESTRY_META|')
               const msgMeta = parts[1]
               const subnetMatch = msgMeta.match(/subnet=([^|]+)/)
               if (subnetMatch && subnetMatch[1] === name) {
                 return true
               }
             }
             return false
          })
          .map((item: any) => {
            const parts = item.content.text.split('|TAPESTRY_META|')
            return {
              id: item.content.id,
              content: parts[0].trim(),
              author: {
                username: item.authorProfile.username,
                avatarUrl: item.authorProfile.image,
                walletAddress: item.authorProfile.id,
              },
              createdAt: item.content.created_at,
              isOwnMsg: mainUsername === item.authorProfile.username
            }
          })
          .sort((a: ChatMessage, b: ChatMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        
        setMessages(msgs)
      }
    } catch (e) {
      console.error('Failed to load messages', e)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [name, canView, mainUsername])

  useEffect(() => {
    fetchMessages()
    // Polling setup optional here
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  const handleJoin = async () => {
    if (!mainUsername) return
    setJoinError('')

    // Validate if gated
    if (isGated && fairScore !== null) {
      if (fairScore < gateScore) {
        setJoinError(`Your FairScore (${fairScore}) does not meet the requirement (${gateScore}).`)
        return
      }
    }

    try {
      await followUser({ followerUsername: mainUsername, followeeUsername: username })
      await refetchState()
    } catch (e: any) {
      setJoinError(e.message || 'Failed to join community.')
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!mainUsername || !walletAddress) return
    
    // Inject custom target meta into bio post string
    const targetMetaPayload = `${content} |TAPESTRY_META|subnet=${name}`
    
    try {
      const properties = [{ key: 'subnet', value: name }]
      const res = await fetch('/api/contents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerWalletAddress: publicKey?.toBase58() || walletAddress,
          content: targetMetaPayload,
          properties
        })
      })

      if (!res.ok) throw new Error('Failed to send message')

      // Fetch directly after sending
      setTimeout(() => {
        fetchMessages()
      }, 1000)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      <main className="flex-1 max-w-[600px] w-full border-x border-zinc-900 flex flex-col h-screen">
        {/* Community Header (Sticky) */}
        <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-900 px-4 py-3 shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-xl border border-zinc-800 shadow-inner">
                 {image ? (
                   <Image src={image} alt={name} width={44} height={44} unoptimized className="object-cover w-full h-full rounded-xl" />
                 ) : (
                   <Hash className="h-5 w-5 text-[#1d9aef]" />
                 )}
               </div>
               <div className="flex flex-col overflow-hidden leading-tight gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-[17px] font-black text-white truncate">{name}</h1>
                    <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 font-medium">Group</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 font-medium truncate">@{username}</span>
                    <span className="text-[10px] flex items-center gap-1 text-zinc-400 font-semibold">
                      {isGated ? <Lock className="h-2.5 w-2.5 text-amber-500" /> : <Globe className="h-2.5 w-2.5 text-emerald-500" />}
                      {isGated ? `Rep > ${gateScore}` : 'Public'}
                    </span>
                  </div>
               </div>
            </div>

            {/* Join Button */}
            <div className="shrink-0 ml-2">
              <Button 
                onClick={handleJoin} 
                disabled={isJoined || stateLoading || followLoading || scoreLoading || !mainUsername}
                className={`h-8 px-4 text-xs font-bold rounded-full transition-all ${isJoined ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-800 opacity-100 cursor-default border border-zinc-700' : 'bg-[#1d9aef] text-white hover:bg-[#1d9aef]/90 shadow-[0_0_15px_rgba(29,154,239,0.2)] hover:shadow-[#1d9aef]/40'}`}
              >
                {stateLoading ? <Loader2 className="h-3 w-3 animate-spin mx-2" /> : isJoined ? 'Joined' : 'Join Group'}
              </Button>
            </div>
          </div>
          
          {cleanBio && (
            <p className="text-[12px] text-zinc-400 mt-3 line-clamp-2 px-1">
              {cleanBio}
            </p>
          )}

          {joinError && (
            <div className="mt-3 flex items-start gap-1.5 text-[11px] text-rose-400 font-medium bg-rose-500/10 p-2 rounded-md border border-rose-500/20">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{joinError}</span>
            </div>
          )}
        </header>

        {/* Messaging Content Area */}
        <div className="flex-1 overflow-hidden relative bg-black flex flex-col justify-end">
          {(!canView) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                <Lock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-sm text-zinc-400 max-w-[280px]">
                This community requires a minimum FairScore of <span className="text-amber-400 font-bold">{gateScore}</span> to view and post messages.
              </p>
              {fairScore !== null && (
                <div className="mt-6 bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                   <div className="flex flex-col items-start gap-0.5">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Your Current Score</span>
                     <span className={`text-lg font-black ${fairScore >= gateScore ? 'text-emerald-400' : 'text-rose-400'}`}>{fairScore}</span>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <CommunityChat 
              messages={messages} 
              isLoadingMessages={isLoadingMessages} 
              onSendMessage={handleSendMessage}
              canPost={canPost}
            />
          )}
        </div>
      </main>
    </div>
  )
}
