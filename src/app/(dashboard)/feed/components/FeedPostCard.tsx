"use client"

import { useState } from 'react'
import { MessageSquareText, Share2, MessageCircleReply } from 'lucide-react'
import { clsx } from 'clsx'
import LikePostButton from './LikePostButton'
import DeletePostButton from './DeletePostButton'
import InlineCommentForm from './InlineCommentForm'
import LikeButton from '../../debate/[id]/components/LikeButton'
import DeletePostCommentButton from './DeletePostCommentButton'
import RichText from '@/components/ui/RichText'
import SendMessageModal from '@/components/messaging/SendMessageModal'
import { Mail } from 'lucide-react'

export default function FeedPostCard({ post, currentUserId, isAdmin }: { post: any, currentUserId: string, isAdmin: boolean }) {
    const [showComments, setShowComments] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [messageModal, setMessageModal] = useState<{ isOpen: boolean, receiverId: string, receiverName: string }>({
        isOpen: false,
        receiverId: '',
        receiverName: ''
    })

    const comments = post.comments || []
    const sortedComments = [...comments].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const isLong = (post.content?.length || 0) > 200

    const handleReplyClick = (commentId: string, authorName: string, content: string) => {
        const event = new CustomEvent('inlineReplyRequested', {
            detail: { postId: post.id, commentId, authorName, content }
        })
        window.dispatchEvent(event)
    }

    const isEureka = post.is_eureka_summary

    return (
        <div style={{
            background: isEureka ? 'rgba(196,88,42,0.04)' : 'var(--card)',
            border: `1px solid ${isEureka ? 'rgba(196,88,42,0.25)' : 'var(--bdr)'}`,
            borderRadius: '2px',
            padding: '1rem',
            transition: 'border-color 0.2s',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {/* Avatar */}
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isEureka
                            ? 'linear-gradient(135deg, var(--rust), var(--gold))'
                            : 'linear-gradient(135deg, var(--violet), var(--rust))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 'var(--fs-xs)', textTransform: 'uppercase',
                        flexShrink: 0,
                    }}>
                        {isEureka ? 'E' : (post.users?.clerk_username?.charAt(0) || '?')}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isEureka ? 'Eureka' : (post.users?.clerk_username || 'Unknown User')}
                            {isEureka && (
                                <span style={{ background: 'var(--rust)', color: '#fff', fontSize: 'var(--fs-xs)', padding: '0.15rem 0.4rem', borderRadius: '2px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Summary</span>
                            )}
                            {!isEureka && post.users?.role === 'admin' && (
                                <span style={{ background: 'var(--violet)', color: '#fff', fontSize: 'var(--fs-xs)', padding: '0.15rem 0.4rem', borderRadius: '2px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin</span>
                            )}
                        </div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', fontFamily: "'DM Mono', monospace" }}>
                            {new Date(post.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isEureka && currentUserId !== post.author_id && (
                        <button
                            onClick={() => setMessageModal({ isOpen: true, receiverId: post.author_id, receiverName: post.users?.clerk_username || 'User' })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px', color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="hover:bg-gray-100 hover:text-[var(--violet)] transition-all"
                            title="Message User"
                        >
                            <Mail size={16} />
                        </button>
                    )}
                    {(currentUserId === post.author_id || isAdmin) && <DeletePostButton postId={post.id} />}
                </div>
            </div>

            {/* Content */}
            <div style={{ marginTop: '0.75rem' }}>
                <div className={clsx(!expanded && isLong && "max-h-[220px] overflow-hidden relative")}>
                    <RichText content={post.content} />
                    {!expanded && isLong && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                            background: 'linear-gradient(to top, var(--card), transparent)',
                            pointerEvents: 'none'
                        }} />
                    )}
                </div>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 'var(--fs-xs)', marginTop: '0.3rem', display: 'block', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <LikePostButton
                    postId={post.id}
                    initialLikes={post.likes?.length || 0}
                    initialUserLiked={post.likes?.some((l: any) => l.user_id === currentUserId) || false}
                />

                <button
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: 'var(--fs-sm)', fontWeight: 600, fontFamily: "'DM Mono', monospace",
                        color: showComments ? 'var(--gold)' : 'var(--sub)',
                        background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
                        transition: 'color 0.2s',
                    }}
                >
                    <MessageSquareText size={16} />
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </button>

                <button
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: 'var(--fs-sm)', fontWeight: 600, fontFamily: "'DM Mono', monospace",
                        color: 'var(--sub)', background: 'none', border: 'none',
                        marginLeft: 'auto', opacity: 0.4, cursor: 'default',
                    }}
                >
                    <Share2 size={16} />
                    Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed var(--bdr)' }}>
                    {sortedComments.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--sub)', padding: '0.75rem', background: 'var(--surf)', borderRadius: '2px', marginBottom: '0.75rem', border: '1px solid var(--bdr)' }}>
                            No responses yet. Be the first to add to the discussion!
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sortedComments.map((comment: any) => (
                            <div key={comment.id} style={{
                                background: 'var(--surf)', borderRadius: '2px', padding: '0.65rem',
                                border: '1px solid var(--bdr)', fontSize: 'var(--fs-base)', position: 'relative',
                            }}>
                                {/* Quoted reply */}
                                {comment.parent_id && (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        background: 'rgba(0,0,0,0.2)',
                                        margin: '-0.65rem -0.65rem 0.5rem -0.65rem',
                                        padding: '0.4rem 0.65rem',
                                        borderLeft: '2px solid var(--violet-lt)',
                                        borderBottom: '1px solid var(--bdr)',
                                    }}>
                                        <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--violet-lt)', fontFamily: "'DM Mono', monospace" }}>
                                            {sortedComments.find((c: any) => c.id === comment.parent_id)?.users?.clerk_username || 'Participant'}
                                        </div>
                                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', marginTop: '0.1rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                            {(sortedComments.find((c: any) => c.id === comment.parent_id)?.content || 'Original message removed').replace(/<[^>]*>?/gm, '')}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>
                                            {comment.users?.clerk_username || 'Unknown User'}
                                        </div>
                                        {currentUserId !== comment.author_id && (
                                            <button
                                                onClick={() => setMessageModal({ isOpen: true, receiverId: comment.author_id, receiverName: comment.users?.clerk_username || 'User' })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)' }}
                                                className="hover:text-[var(--violet)] transition-colors"
                                                title="Message User"
                                            >
                                                <Mail size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', fontFamily: "'DM Mono', monospace" }}>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div style={{ color: 'var(--text)', marginBottom: '0.4rem' }}>
                                    <RichText content={comment.content} small />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--bdr)', paddingTop: '0.35rem', marginTop: '0.1rem' }}>
                                    <LikeButton
                                        commentId={comment.id}
                                        initialLikes={comment.likes?.length || 0}
                                        initialUserLiked={comment.likes?.some((l: any) => l.user_id === currentUserId) || false}
                                    />

                                    <button
                                        onClick={() => handleReplyClick(comment.id, comment.users?.clerk_username || 'Unknown User', comment.content)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                                            fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                            fontFamily: "'DM Mono', monospace", color: 'var(--sub)', background: 'none', border: 'none',
                                            cursor: 'pointer', transition: 'color 0.2s',
                                        }}
                                    >
                                        <MessageCircleReply size={13} />
                                        Reply
                                    </button>

                                    {(currentUserId === comment.author_id || isAdmin) && (
                                        <div style={{ marginLeft: 'auto' }}>
                                            <DeletePostCommentButton commentId={comment.id} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <InlineCommentForm postId={post.id} />
                </div>
            )}

            <SendMessageModal
                isOpen={messageModal.isOpen}
                onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
                receiverId={messageModal.receiverId}
                receiverName={messageModal.receiverName}
            />
        </div>
    )
}
