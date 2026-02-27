import { Card } from '@/components/common/card'
import { LikeButton } from '@/components/profile/comments/like-button'
import { IComments } from '@/models/comment.models'
import { formatRelativeTime } from '@/utils/utils'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CommentItemProps {
  comment: IComments
  handleLike: (id: string) => void
  handleUnlike: (id: string) => void
}

export function CommentItem({
  comment,
  handleLike,
  handleUnlike,
}: CommentItemProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <Card className="w-full space-y-4">
      <div className="flex space-x-1 items-center justify-end text-gray text-sm">
        <p className="pr-2">
          {mounted ? formatRelativeTime(comment.comment.created_at) : '...'} by
        </p>
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt="avatar"
            width={15}
            height={15}
            className="object-cover rounded-full"
            unoptimized
          />
        ) : (
          <div className="bg-muted-light rounded-full w-[15px] h-[15px] flex items-center justify-center">
            <User size={13} className="text-muted" />
          </div>
        )}
        <Link href={`/${comment.author.username}`} className="hover:underline">
          <p>{comment.author.username}</p>
        </Link>
      </div>

      <div>
        {(() => {
          let text = comment.comment.text || ''
          let imageUrlValue: string | undefined = undefined
          
          if (text.includes('|TAPESTRY_META|')) {
            const parts = text.split('|TAPESTRY_META|')
            text = parts[0].trim()
            const meta = parts[1]
            const imgMatch = meta.match(/imageUrl=([^|]+)/)
            if (imgMatch) imageUrlValue = imgMatch[1]
          }

          return (
            <>
              <p className="text-zinc-200">{text}</p>
              {imageUrlValue && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrlValue} 
                    alt="Comment attachment" 
                    className="w-full h-auto max-h-[400px] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </>
          )
        })()}
      </div>

      {comment.requestingProfileSocialInfo && comment.socialCounts && (
        <LikeButton
          initialLikeCount={comment.socialCounts.likeCount}
          initiallyLiked={comment?.requestingProfileSocialInfo?.hasLiked}
          onLike={() => handleLike(comment.comment.id)}
          onUnlike={() => handleUnlike(comment.comment.id)}
        />
      )}
    </Card>
  )
}
