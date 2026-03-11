'use client'

import { useState } from 'react'
import { deleteFlaggedCommentAction, deletePostAdminAction } from '../actions'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

export default function FlaggedContentPanel({ flaggedComments, recentPosts }: { flaggedComments: any[], recentPosts: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [tab, setTab] = useState<'comments' | 'posts'>('comments')

    async function handle(fn: () => Promise<void>, key: string) {
        setLoading(key)
        try { await fn() } catch (e: any) { alert(e.message) }
        setLoading(null)
    }

    const tabStyle = (active: boolean) => ({
        padding: '0.4rem 0.9rem',
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.5rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        cursor: 'pointer',
        background: active ? 'var(--rust)' : 'var(--surf)',
        color: active ? '#fff' : 'var(--sub)',
        border: `1px solid ${active ? 'var(--rust)' : 'var(--bdr)'}`,
        borderRadius: '2px',
        transition: 'all 0.15s',
    })

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button style={tabStyle(tab === 'comments')} onClick={() => setTab('comments')}>
                    Flagged Comments ({flaggedComments.length})
                </button>
                <button style={tabStyle(tab === 'posts')} onClick={() => setTab('posts')}>
                    All Recent Posts ({recentPosts.length})
                </button>
            </div>

            {tab === 'comments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {flaggedComments.length === 0 && (
                        <div style={{ color: 'var(--sub)', fontSize: '0.75rem', textAlign: 'center', padding: '1.5rem' }}>
                            ✅ No flagged comments
                        </div>
                    )}
                    {flaggedComments.map(comment => (
                        <div key={comment.id} style={{
                            padding: '0.75rem', background: 'var(--surf)',
                            border: '1px solid rgba(196,88,42,0.25)', borderRadius: '2px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', fontWeight: 700, color: 'var(--sub)' }}>
                                            {comment.users?.clerk_username || 'Unknown'}
                                        </span>
                                        {comment.is_fluff && <span style={{ background: 'rgba(201,151,42,0.2)', color: 'var(--gold)', fontSize: '0.44rem', padding: '0.1rem 0.35rem', borderRadius: '2px', fontFamily: "'DM Mono', monospace", fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Fluff</span>}
                                        {comment.is_vulgar && <span style={{ background: 'rgba(196,88,42,0.2)', color: 'var(--rust)', fontSize: '0.44rem', padding: '0.1rem 0.35rem', borderRadius: '2px', fontFamily: "'DM Mono', monospace", fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Vulgar</span>}
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.44rem', color: 'var(--sub)' }}>
                                            {comment.stance?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>
                                        {comment.content}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this comment permanently?'))
                                            handle(() => deleteFlaggedCommentAction(comment.id), `del-${comment.id}`)
                                    }}
                                    disabled={!!loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'rgba(196,88,42,0.1)', border: '1px solid rgba(196,88,42,0.3)', borderRadius: '2px', cursor: 'pointer', color: 'var(--rust)', fontSize: '0.62rem', fontWeight: 600, flexShrink: 0 }}
                                >
                                    {loading === `del-${comment.id}` ? <Loader2 size={12} /> : <Trash2 size={12} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'posts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {recentPosts.map(post => (
                        <div key={post.id} style={{
                            padding: '0.75rem', background: 'var(--surf)',
                            border: '1px solid var(--bdr)', borderRadius: '2px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', color: 'var(--sub)', marginBottom: '0.25rem' }}>
                                        {post.users?.clerk_username || 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                        {post.content}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this post permanently?'))
                                            handle(() => deletePostAdminAction(post.id), `del-post-${post.id}`)
                                    }}
                                    disabled={!!loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'rgba(196,88,42,0.1)', border: '1px solid rgba(196,88,42,0.3)', borderRadius: '2px', cursor: 'pointer', color: 'var(--rust)', fontSize: '0.62rem', fontWeight: 600, flexShrink: 0 }}
                                >
                                    {loading === `del-post-${post.id}` ? <Loader2 size={12} /> : <Trash2 size={12} />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
