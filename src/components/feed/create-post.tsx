'use client'

import { useState } from 'react'
import { Button } from '@/components/common/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Hash, Image as ImageIcon, Send } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

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
  const { connected } = useWallet()

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
    <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden mb-6">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full" />
        <span className="font-semibold text-zinc-200">What's on your mind?</span>
      </CardHeader>
      
      <CardContent className="px-4 pb-2">
        <Textarea 
          placeholder={connected ? "Share your thoughts, projects, or alpha..." : "Please connect your wallet to post..."}
          className="min-h-[100px] bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 resize-none focus-visible:ring-0 p-0 text-lg"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!connected || isLoading}
        />
        
        {subnet && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Subnet Dest:</span>
            <span className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              {subnet.startsWith('#') ? subnet : `#${subnet}`}
            </span>
          </div>
        )}

        {showImageInput && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <input 
              type="text" 
              placeholder="Paste Image URL here..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50 transition-colors"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!connected || isLoading}
            />
            {imageUrl && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/50 h-32 flex items-center justify-center">
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
      </CardContent>

      <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-zinc-900 bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-purple-400 hover:bg-zinc-900 rounded-full transition-colors flex items-center justify-center">
              <Hash className="h-4 w-4" />
            </Button>
            {/* Simple popup for inputting subnet */}
            <div className="absolute top-full left-0 mt-2 p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 w-48">
              <input 
                type="text" 
                placeholder="e.g. SolanaDevs" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                value={subnet}
                onChange={(e) => setSubnet(e.target.value)}
                disabled={!connected || isLoading}
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setShowImageInput(!showImageInput)}
            className={`h-8 w-8 p-0 rounded-full transition-colors flex items-center justify-center ${showImageInput || imageUrl ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-900'}`}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={!content.trim() || !connected || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-1.5 h-auto text-sm font-semibold transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? 'Posting...' : (
            <span className="flex items-center gap-2">
              Post <Send className="h-3 w-3" />
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
