"use client"

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { clsx } from 'clsx'
import { toggleLikeCommentAction } from '../actions'
import { usePathname } from 'next/navigation'

export default function LikeButton({
    commentId,
    initialLikes,
    initialUserLiked
}: {
    commentId: string,
    initialLikes: number,
    initialUserLiked: boolean
}) {
    const [liked, setLiked] = useState(initialUserLiked)
    const [likes, setLikes] = useState(initialLikes)
    const [isPending, setIsPending] = useState(false)
    const pathname = usePathname()

    const handleLike = async () => {
        if (isPending) return;

        // Optimistic UI update
        setIsPending(true)
        setLiked(!liked)
        setLikes(prev => liked ? prev - 1 : prev + 1)

        try {
            await toggleLikeCommentAction(commentId, pathname)
        } catch (error) {
            // Revert optimistic update on failure
            setLiked(liked)
            setLikes(initialLikes)
            alert("Failed to toggle like.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={clsx(
                "flex items-center gap-1.5 text-xs font-bold transition-colors p-1 px-2 rounded-lg cursor-pointer",
                liked
                    ? "bg-[#0055ff]/10 text-[#0055ff]"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            )}
        >
            <ThumbsUp size={14} className={clsx(liked && "fill-current")} />
            {likes > 0 ? likes : 'Like'}
        </button>
    )
}
