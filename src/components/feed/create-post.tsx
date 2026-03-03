'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/common/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Hash, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProfileStore } from '@/store/profile'

export function CreatePost({
  onSubmit,
  isLoading,
  forcedSubnet
}: {
  onSubmit: (content: string, subnet: string, imageUrl?: string) => void
  isLoading?: boolean
  forcedSubnet?: string
}) {
  const [content, setContent] = useState('')
  const [subnet, setSubnet] = useState(forcedSubnet || '')
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
    <div className="border-b border-[#3f3f46] pb-4 px-4 pt-5 mb-2 bg-[#050507]/30">
      <div className="flex gap-4">
         <Avatar className="h-10 w-10 mt-1 ring-1 ring-white/10 shadow-xl border-zinc-800 border">
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
              placeholder={mounted && connected ? "What's on your mind?!" : (mounted ? "Please connect your wallet to post..." : "Loading...")}
              className="min-h-[60px] bg-transparent border-none text-white placeholder:text-zinc-600 resize-none focus-visible:ring-0 p-0 text-[19px] font-semibold leading-normal py-1 shadow-none tracking-tight"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!connected || isLoading}
            />

            {subnet && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#1d9aef] bg-[#1d9aef]/10 px-2.5 py-1 rounded-full border border-[#1d9aef]/20 shadow-[0_0_10px_rgba(29,154,239,0.1)]">
                  {subnet.startsWith('#') ? subnet : `#${subnet}`}
                </span>
              </div>
            )}

            {showImageInput && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Paste Image URL here..." 
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#1d9aef]/50 transition-all"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={!connected || isLoading}
                  />
                  <ImageIcon className="absolute right-3.5 top-3 h-4 w-4 text-zinc-700" />
                </div>
                {imageUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-white/5 bg-black h-40 flex items-center justify-center p-1 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-full max-w-full object-contain rounded-lg"
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

            <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3.5">
              <div className="flex items-center gap-1.5 ml-1">
                 <div className="relative group/subnet">
                   {!forcedSubnet && (
                     <>
                       <Button 
                         variant="ghost" 
                         className="h-9 w-9 p-0 text-[#1d9aef] hover:bg-[#1d9aef]/10 rounded-full transition-all flex items-center justify-center hover:scale-110 active:scale-90"
                         disabled={!mounted}
                       >
                         {mounted && <Hash className="h-4.5 w-4.5" />}
                       </Button>
                       <div className="absolute top-full left-0 mt-3 p-3 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/subnet:opacity-100 group-hover/subnet:visible transition-all duration-300 z-50 w-56 backdrop-blur-xl">
                         <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2 px-1">Choose Subnet</div>
                         <input 
                           type="text" 
                           placeholder="e.g. SolanaDevs" 
                           className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1d9aef]/50 shadow-inner"
                           value={subnet}
                           onChange={(e) => setSubnet(e.target.value)}
                           disabled={!connected || isLoading}
                         />
                       </div>
                     </>
                   )}
                 </div>
                 
                 <Button 
                   variant="ghost" 
                   onClick={() => setShowImageInput(!showImageInput)}
                   className={`h-9 w-9 p-0 rounded-full transition-all flex items-center justify-center hover:scale-110 active:scale-90 ${showImageInput || imageUrl ? 'text-[#1d9aef] bg-[#1d9aef]/10' : 'text-[#1d9aef] hover:bg-[#1d9aef]/10'}`}
                   disabled={!mounted}
                 >
                   {mounted && <ImageIcon className="h-4.5 w-4.5" />}
                 </Button>
              </div>

               <Button 
                onClick={handleSubmit} 
                disabled={!content.trim() || !connected || isLoading || !mounted}
                className="bg-[#1d9aef] hover:bg-[#1a8cd8] text-white rounded-full px-7 h-9 text-[13px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-30 border-none shadow-[0_4px_15px_rgba(29,154,239,0.25)] hover:shadow-[0_6px_20px_rgba(29,154,239,0.4)] active:scale-95"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post Content'}
              </Button>
            </div>
         </div>
      </div>
    </div>
  )
}
