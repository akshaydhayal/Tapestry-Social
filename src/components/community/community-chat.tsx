'use client'

import { Check, CheckCheck, Loader2, Send } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export interface ChatMessage {
  id: string
  content: string
  author: {
    username: string
    avatarUrl?: string
    walletAddress: string
  }
  createdAt: string
  isOwnMsg: boolean
}

interface Props {
  messages: ChatMessage[]
  isLoadingMessages: boolean
  onSendMessage?: (content: string) => Promise<void>
  canPost: boolean
  currentUsername?: string
}

export function CommunityChat({ messages, isLoadingMessages, onSendMessage, canPost, currentUsername }: Props) {
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !onSendMessage || isSending) return

    try {
      setIsSending(true)
      await onSendMessage(inputText)
      setInputText('')
    } catch (error) {
      console.error('Finished sending with error', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-black/95 relative border-t border-zinc-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoadingMessages ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#1d9aef] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
            <span className="text-4xl text-zinc-700">👋</span>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showAvatar = !msg.isOwnMsg && (index === 0 || messages[index - 1].author.walletAddress !== msg.author.walletAddress)
            
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.isOwnMsg ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.isOwnMsg ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar for others */}
                  {!msg.isOwnMsg && (
                    <div className="w-8 shrink-0 flex flex-col justify-end pb-1">
                      {showAvatar && (
                        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                          {msg.author.avatarUrl ? (
                            <Image src={msg.author.avatarUrl} alt={msg.author.username} width={32} height={32} unoptimized className="object-cover w-full h-full" />
                          ) : (
                            <div className="h-full w-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 uppercase">
                              {msg.author.username.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* Name for others (if avatar is shown, show name) */}
                    {!msg.isOwnMsg && showAvatar && (
                      <span className="text-[11px] font-bold text-zinc-400 pl-1">{msg.author.username}</span>
                    )}
                    
                    {/* Bubble */}
                    <div 
                      className={`relative px-4 pt-2 pb-3 rounded-2xl ${
                        msg.isOwnMsg 
                          ? 'bg-[#1d9aef] text-white rounded-br-sm' 
                          : 'bg-zinc-800/80 text-zinc-100 rounded-bl-sm border border-zinc-700/50'
                      }`}
                      style={{
                         boxShadow: msg.isOwnMsg ? '0 2px 10px rgba(29, 154, 239, 0.2)' : '0 2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{msg.content}</p>
                      
                      <div className={`flex items-center gap-1 absolute bottom-1 ${msg.isOwnMsg ? 'right-2' : 'right-2'}`}>
                        <span className={`text-[9px] ${msg.isOwnMsg ? 'text-blue-100/70' : 'text-zinc-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.isOwnMsg && (
                          <CheckCheck className="h-3 w-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-900 shrink-0">
        {canPost ? (
          <form onSubmit={handleSend} className="flex gap-2 items-end">
             <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl focus-within:border-[#1d9aef] transition-colors relative">
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault()
                     handleSend(e)
                   }
                 }}
                 placeholder="Type a message..."
                 className="w-full bg-transparent text-white px-4 py-3 min-h-[44px] max-h-[120px] outline-none resize-none text-sm placeholder:text-zinc-500 custom-scrollbar"
                 rows={1}
               />
             </div>
             <button
               type="submit"
               disabled={!inputText.trim() || isSending}
               className="h-[44px] w-[44px] shrink-0 rounded-full bg-[#1d9aef] hover:bg-[#1d9aef]/90 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
             >
               {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
             </button>
          </form>
        ) : (
          <div className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 text-center">
            <p className="text-[13px] text-zinc-400 font-medium">You must join this community to send messages.</p>
          </div>
        )}
      </div>
    </div>
  )
}
