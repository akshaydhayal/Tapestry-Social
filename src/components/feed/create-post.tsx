'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Hash, Image as ImageIcon } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProfileStore } from '@/store/profile'

export function CreatePost({
  onSubmit,
  isLoading
}: {
  onSubmit: (content: string, subnet: string, imageUrl?: string) => void
  isLoading?: boolean
}) {
  const [content, setContent] = useState('')
  const [subnet, setSubnet] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { connected } = useWallet()
  const { mainUsername, profileImage } = useProfileStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = () => {
    if (!content.trim() || !connected) return
    onSubmit(
      content, 
      subnet.startsWith('#') ? subnet : subnet ? `#${subnet}` : '',
      imageUrl
    )
    setContent('')
    setSubnet('')
    setImageUrl('')
    setShowImageInput(false)
  }

  return (
    <div className="border-t border-b border-slate-600 pb-2 px-4 pt-4 mb-4">
      <div className="flex gap-3">
         <Avatar className="h-10 w-10 mt-1 ring-0">
           {profileImage ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={profileImage} alt={mainUsername || 'Profile'} className="w-full h-full object-cover" />
           ) : (
             <div className="h-full w-full bg-gradient-to-br from-[#1d9aef] to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
               {mainUsername ? mainUsername.charAt(0).toUpperCase() : '?'}
             </div>
           )}
         </Avatar>
         
         <div className="flex-1 min-w-0">
            <Textarea 
              placeholder={mounted && connected ? "What is happening?!" : (mounted ? "Please connect your wallet to post..." : "Loading...")}
              className="min-h-[50px] bg-transparent border-none text-white placeholder:text-zinc-500 resize-none focus-visible:ring-0 p-0 text-xl py-2 shadow-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!connected || isLoading}
            />

            {subnet && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-semibold text-[#1d9aef] bg-[#1d9aef]/10 px-2 py-0.5 rounded-full border border-transparent">
                  {subnet.startsWith('#') ? subnet : `#${subnet}`}
                </span>
              </div>
            )}

            {showImageInput && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input 
                  type="text" 
                  placeholder="Paste Image URL here..." 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#1d9aef] transition-colors"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!connected || isLoading}
                />
                {imageUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/50 h-32 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-zinc-900 mt-3 pt-3">
              <div className="flex items-center gap-1">
                 <div className="relative group">
                   <Button 
                     variant="ghost" 
                     className="h-8 w-8 p-0 text-[#1d9aef] hover:bg-[#1d9aef]/10 rounded-full transition-colors flex items-center justify-center"
                     disabled={!mounted}
                   >
                     {mounted && <Hash className="h-4 w-4" />}
                   </Button>
                   <div className="absolute top-full left-0 mt-2 p-2 bg-black border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-48">
                     <input 
                       type="text" 
                       placeholder="e.g. SolanaDevs" 
                       className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#1d9aef]"
                       value={subnet}
                       onChange={(e) => setSubnet(e.target.value)}
                       disabled={!connected || isLoading}
                     />
                   </div>
                 </div>
                 
                 <Button 
                   variant="ghost" 
                   onClick={() => setShowImageInput(!showImageInput)}
                   className={`h-8 w-8 p-0 rounded-full transition-colors flex items-center justify-center ${showImageInput || imageUrl ? 'text-[#1d9aef] bg-[#1d9aef]/10' : 'text-[#1d9aef] hover:bg-[#1d9aef]/10'}`}
                   disabled={!mounted}
                 >
                   {mounted && <ImageIcon className="h-4 w-4" />}
                 </Button>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!content.trim() || !connected || isLoading || !mounted}
                className="bg-[#1d9aef] hover:bg-[#1a8cd8] text-white rounded-full px-5 py-1.5 h-auto text-[15px] font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
         </div>
      </div>
    </div>
  )
}
