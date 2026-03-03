'use client'

import { useState } from 'react'
import { Button } from '@/components/common/button'
import { Textarea } from '@/components/ui/textarea'
import { Image as ImageIcon, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog/dialog'
import { useWallet } from '@solana/wallet-adapter-react'
import { useProfileStore } from '@/store/profile'

export function CreateCommunityPostModal({
  onSubmit,
  communityName
}: {
  onSubmit: (content: string, subnet: string, imageUrl?: string) => Promise<void>
  communityName: string
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { connected } = useWallet()
  const { mainUsername } = useProfileStore()

  const handleSubmit = async () => {
    if ((!title.trim() && !description.trim()) || !connected) return
    
    setIsSubmitting(true)
    try {
      const fullContent = title.trim() ? `**${title.trim()}**\n\n${description.trim()}` : description.trim()
      await onSubmit(fullContent, communityName, imageUrl)
      setTitle('')
      setDescription('')
      setImageUrl('')
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] font-black uppercase tracking-widest rounded-full text-[12px] h-8 px-5 transition-all duration-300 transform active:scale-95 border-none">
          Create Post
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 p-0 overflow-hidden text-white gap-0 shadow-2xl">
        <DialogHeader className="px-5 py-4 border-b border-white/5 bg-black">
          <DialogTitle className="text-xl font-bold tracking-tight">Post into {communityName}</DialogTitle>
        </DialogHeader>
        
        <div className="p-5 flex flex-col gap-4 bg-zinc-950/50 backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Post Title (Optional)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 px-1"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <Textarea 
            placeholder="Share what's on your mind..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[140px] bg-transparent border-none text-base text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-0 p-1 resize-none shadow-none leading-relaxed"
            disabled={isSubmitting}
          />
          
          <div className="mt-2 animate-in fade-in duration-300">
             <div className="relative group">
               <input 
                 type="text" 
                 placeholder="Paste Image URL here... (Optional)" 
                 className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-[#1d9aef]/50 transition-all placeholder:text-zinc-700"
                 value={imageUrl}
                 onChange={(e) => setImageUrl(e.target.value)}
                 disabled={isSubmitting}
               />
               <ImageIcon className="absolute right-3.5 top-3 h-4 w-4 text-zinc-700 group-focus-within:text-[#1d9aef]/50 transition-colors" />
             </div>
             
             {imageUrl && (
               <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10 bg-black h-48 flex items-center justify-center p-1">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={imageUrl} 
                   alt="Preview" 
                   className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
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
        </div>
        
        <div className="px-5 py-4 border-t border-white/5 bg-black flex justify-end items-center">
          <Button 
            onClick={handleSubmit}
            disabled={(!title.trim() && !description.trim()) || isSubmitting || !connected}
            className="bg-[#1d9aef] hover:bg-[#1a8cd8] text-white rounded-full px-8 h-10 transition-all font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(29,154,239,0.2)]"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isSubmitting ? 'Posting...' : 'Post Content'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
