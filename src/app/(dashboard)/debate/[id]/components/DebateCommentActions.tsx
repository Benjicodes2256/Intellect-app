"use client"

import { useState } from 'react'
import { CornerDownRight } from 'lucide-react'
import LikeButton from './LikeButton'
import DeleteCommentButton from './DeleteCommentButton'
import InlineDebateReplyForm from './InlineDebateReplyForm'

interface Props {
    comment: any;
    debateId: string;
    userId: string;
    isClosed: boolean;
    isAdmin?: boolean;
}

export default function DebateCommentActions({ comment, debateId, userId, isClosed, isAdmin = false }: Props) {
    const [isReplying, setIsReplying] = useState(false)

    const initialLikes = comment.likes?.length || 0;
    const initialUserLiked = comment.likes?.some((l: any) => l.user_id === userId) || false;

    return (
        <div className="flex flex-col w-full pt-1.5 mt-1 border-t border-black/5 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-6">
                    <LikeButton
                        commentId={comment.id}
                        initialLikes={initialLikes}
                        initialUserLiked={initialUserLiked}
                    />

                    {!isClosed && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0055ff] transition-colors hover:bg-blue-50 px-2 py-1 -ml-2 rounded-md"
                        >
                            <CornerDownRight size={14} />
                            Reply
                        </button>
                    )}
                </div>

                {(userId === comment.author_id || isAdmin) && !isClosed && (
                    <DeleteCommentButton
                        commentId={comment.id}
                        debateId={debateId}
                    />
                )}
            </div>

            {isReplying && !isClosed && (
                <div className="w-full mt-2">
                    <InlineDebateReplyForm
                        debateId={debateId}
                        parentId={comment.id}
                        parentAuthorName={comment.users?.clerk_username || 'Unknown User'}
                        onClose={() => setIsReplying(false)}
                    />
                </div>
            )}
        </div>
    )
}
