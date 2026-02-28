"use client"

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { clsx } from 'clsx'
import { toggleLikePostAction } from '../actions'

interface LikePostButtonProps {
    postId: string;
    initialLikes: number;
    initialUserLiked: boolean;
}

export default function LikePostButton({ postId, initialLikes, initialUserLiked }: LikePostButtonProps) {
    const [liked, setLiked] = useState(initialUserLiked)
    const [likesCount, setLikesCount] = useState(initialLikes)
    const [isLiking, setIsLiking] = useState(false)

    const handleLike = async () => {
        if (isLiking) return

        // Optimistically update UI
        setLiked(!liked)
        setLikesCount(liked ? likesCount - 1 : likesCount + 1)
        setIsLiking(true)

        try {
            await toggleLikePostAction(postId, "/feed")
        } catch (error: any) {
            // Revert on failure
            setLiked(liked)
            setLikesCount(likesCount)
            alert(error.message || "Failed to toggle like")
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            disabled={isLiking}
            className={clsx(
                "flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                liked ? "text-[#ff5500]" : "text-gray-500 hover:text-[#ff5500]"
            )}
        >
            <ThumbsUp size={18} className={liked ? "fill-current" : ""} />
            {likesCount}
        </button>
    )
}
