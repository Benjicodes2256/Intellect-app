"use client"

import { useState } from 'react'
import LikeButton from './LikeButton'
import DeleteCommentButton from './DeleteCommentButton'
import SendMessageModal from '@/components/messaging/SendMessageModal'
import { CornerDownRight, Mail } from 'lucide-react'

interface Props {
    comment: any;
    debateId: string;
    userId: string;
    isClosed: boolean;
    isAdmin?: boolean;
}
export default function DebateCommentActions({ comment, debateId, userId, isClosed, isAdmin = false }: Props) {
    const initialLikes = comment.likes?.length || 0;
    const initialUserLiked = comment.likes?.some((l: any) => l.user_id === userId) || false;
    const [messageModal, setMessageModal] = useState({ isOpen: false });

    const handleReplyClick = () => {
        const event = new CustomEvent('inlineDebateReplyRequested', {
            detail: { 
                debateId, 
                commentId: comment.id, 
                authorName: comment.users?.clerk_username || 'Participant', 
                content: comment.content.replace(/<[^>]*>?/gm, '') 
            }
        })
        window.dispatchEvent(event)
    }
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
                            onClick={handleReplyClick}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0055ff] transition-colors hover:bg-blue-50 px-2 py-1 -ml-2 rounded-md"
                        >
                            <CornerDownRight size={14} />
                            Reply
                        </button>
                    )}

                    {userId !== comment.author_id && (
                        <button
                            onClick={() => setMessageModal({ isOpen: true })}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--violet)] transition-colors hover:bg-violet-50 px-2 py-1 rounded-md"
                            title="Message User"
                        >
                            <Mail size={14} />
                            Message
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

            <SendMessageModal
                isOpen={messageModal.isOpen}
                onClose={() => setMessageModal({ isOpen: false })}
                receiverId={comment.author_id}
                receiverName={comment.users?.clerk_username || 'Participant'}
            />
        </div>
    )
}
