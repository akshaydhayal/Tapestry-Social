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
      // Format the content to include the title naturally since tapestry only accepts a single text field
      const fullContent = title.trim() ? `**${title.trim()}**\n\n${description.trim()}` : description.trim()
      
      await onSubmit(fullContent, communityName, imageUrl)
      
      // Reset and close on success
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
        <Button className="bg-[#1d9aef] hover:bg-[#1a8cd8] text-white shadow-md font-bold rounded-full text-sm h-9 px-5 transition-all">
          Create Post
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 p-0 overflow-hidden text-white gap-0">
        <DialogHeader className="px-5 py-4 border-b border-zinc-900 bg-black">
          <DialogTitle className="text-xl font-bold">Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="p-5 flex flex-col gap-4 bg-zinc-950">
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0 px-1 placeholder:font-bold"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <Textarea 
            placeholder="Post description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[120px] bg-transparent border-none text-base text-white placeholder:text-zinc-600 focus-visible:ring-0 p-1 resize-none shadow-none"
            disabled={isSubmitting}
          />
          
          <div className="mt-2 animate-in fade-in duration-200">
             <input 
               type="text" 
               placeholder="Paste Image URL here... (Optional)" 
               className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#1d9aef] transition-colors"
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               disabled={isSubmitting}
             />
             {imageUrl && (
               <div className="mt-3 relative rounded-lg overflow-hidden border border-zinc-800 bg-black h-40 flex items-center justify-center">
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
        </div>
        
        <div className="px-5 py-3 border-t border-zinc-900 bg-black flex justify-end items-center">
          <Button 
            onClick={handleSubmit}
            disabled={(!title.trim() && !description.trim()) || isSubmitting || !connected}
            className="bg-[#1d9aef] hover:bg-[#1a8cd8] text-white rounded-full px-6 transition-all font-bold disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
