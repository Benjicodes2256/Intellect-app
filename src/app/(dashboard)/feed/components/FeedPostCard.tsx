"use client"

import { useState } from 'react'
import { MessageSquareText, Share2, MessageCircleReply } from 'lucide-react'
import { clsx } from 'clsx'
import LikePostButton from './LikePostButton'
import DeletePostButton from './DeletePostButton'
import InlineCommentForm from './InlineCommentForm'
import LikeButton from '../../debate/[id]/components/LikeButton'
import DeletePostCommentButton from './DeletePostCommentButton'

export default function FeedPostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
    const [showComments, setShowComments] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const comments = post.comments || []
    // Sort ascending for chronological thread
    const sortedComments = [...comments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const isLong = post.content.length > 200

    const handleReplyClick = (commentId: string, authorName: string, content: string) => {
        const event = new CustomEvent('inlineReplyRequested', {
            detail: { postId: post.id, commentId, authorName, content }
        })
        window.dispatchEvent(event)
    }

    return (
        <div className={clsx(
            "bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border p-4 transition-all",
            post.is_eureka_summary ? "border-[#ff5500]/30 bg-[#ff5500]/5" : "border-gray-100"
        )}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0055ff] to-[#ff5500] flex items-center justify-center text-white font-bold text-xs uppercase">
                        {post.users?.clerk_username?.charAt(0) || '?'}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                            {post.users?.clerk_username || 'Unknown User'}
                            {post.is_eureka_summary && <span className="bg-[#ff5500] text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">AI Summary</span>}
                            {post.users?.role === 'admin' && <span className="bg-[#0055ff] text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">Admin</span>}
                        </div>
                        <div className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {currentUserId === post.author_id && (
                    <DeletePostButton postId={post.id} />
                )}
            </div>

            <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {expanded || !isLong ? post.content : `${post.content.substring(0, 200)}...`}

                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[#0055ff] font-semibold text-xs mt-1 block hover:underline"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-6">
                <LikePostButton
                    postId={post.id}
                    initialLikes={post.likes?.length || 0}
                    initialUserLiked={post.likes?.some((l: any) => l.user_id === currentUserId) || false}
                />

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={clsx(
                        "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                        showComments ? "text-[#0055ff]" : "text-gray-500 hover:text-[#0055ff]"
                    )}
                >
                    <MessageSquareText size={18} />
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </button>

                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors ml-auto pointer-events-none opacity-50">
                    <Share2 size={18} />
                    Share
                </button>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    {sortedComments.length === 0 && (
                        <div className="text-center text-xs text-gray-500 py-3 bg-gray-50 rounded-xl mb-4 border border-gray-100 font-medium">
                            No responses yet. Be the first to add to the discussion!
                        </div>
                    )}

                    <div className="space-y-3">
                        {sortedComments.map((comment: any) => (
                            <div key={comment.id} className="bg-gray-50/80 rounded-xl p-3 relative text-sm border border-gray-100">

                                {comment.parent_id && (
                                    <div className="flex flex-col bg-black/5 mx-[-12px] mt-[-12px] mb-2 px-3 py-1.5 border-l-2 border-[#0055ff] border-b border-gray-100">
                                        <div className="text-[10px] font-bold text-[#0055ff]">
                                            {sortedComments.find((c: any) => c.id === comment.parent_id)?.users?.clerk_username || 'Participant'}
                                        </div>
                                        <div className="text-[10px] text-gray-600 truncate mt-0.5 opacity-80">
                                            {sortedComments.find((c: any) => c.id === comment.parent_id)?.content || 'Original message removed'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold flex items-center gap-2">
                                        {comment.users?.clerk_username || 'Unknown User'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="text-gray-800 leading-snug mb-2">
                                    {comment.content}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-1 border-t border-gray-100/50 pt-2">
                                    <LikeButton
                                        commentId={comment.id}
                                        initialLikes={comment.likes?.length || 0}
                                        initialUserLiked={comment.likes?.some((l: any) => l.user_id === currentUserId) || false}
                                    />

                                    <button
                                        onClick={() => handleReplyClick(comment.id, comment.users?.clerk_username || 'Unknown User', comment.content)}
                                        className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#0055ff] transition-colors uppercase tracking-wider"
                                    >
                                        <MessageCircleReply size={14} />
                                        Reply
                                    </button>

                                    {currentUserId === comment.author_id && (
                                        <div className="ml-auto">
                                            <DeletePostCommentButton
                                                commentId={comment.id}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <InlineCommentForm postId={post.id} />
                </div>
            )}
        </div>
    )
}
