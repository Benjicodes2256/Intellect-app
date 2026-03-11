import { Flame, Clock, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import CreateCommentForm from './components/CreateCommentForm'
import DebateCommentActions from './components/DebateCommentActions'
import CloseDebateButton from './components/CloseDebateButton'
import ReopenDebateButton from './components/ReopenDebateButton'
import InviteButton from '@/components/debate/InviteButton'
import RichText from '@/components/ui/RichText'

export const dynamic = 'force-dynamic'

export default async function DebateThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { userId, getToken } = await auth()

    if (!userId) return <div>Please sign in to view this debate.</div>

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: debate, error: debateError } = await supabase
        .from('debates')
        .select('*')
        .eq('id', id)
        .single()

    if (debateError || !debate) notFound()

    const { data: comments } = await supabase
        .from('comments')
        .select('*, users(*), likes(user_id)')
        .eq('debate_id', id)
        .order('created_at', { ascending: true })

    const closesAt = new Date(debate.closes_at)
    const now = new Date()
    const diffTime = closesAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isClosed = debate.is_closed || diffDays <= 0

    // Fetch user role to check if admin
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', userId)
        .single()

    const forComments = comments?.filter(c => c.stance === 'for').length || 0
    const againstComments = comments?.filter(c => c.stance === 'against').length || 0
    const totalStanceComments = forComments + againstComments
    const displayForScore = totalStanceComments > 0 ? Math.round((forComments / totalStanceComments) * 100) : 50
    const displayAgainstScore = totalStanceComments > 0 ? Math.round((againstComments / totalStanceComments) * 100) : 50

    return (
        <div style={{ paddingBottom: '9rem', paddingTop: '0.5rem' }}>

            <div style={{ marginBottom: '1rem' }}>
                {/* Back nav */}
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                        href="/debate"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32,
                            background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: '2px',
                        }}
                    >
                        <ArrowLeft size={16} style={{ color: 'var(--sub)' }} />
                    </Link>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                        Debate Arena
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <InviteButton debateId={debate.id} debateTopic={debate.topic} />
                    </div>
                </div>

                {/* Topic Banner */}
                <div style={{ background: 'var(--card)', borderRadius: '2px', border: '1px solid var(--bdr)', padding: '1.25rem' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            background: 'rgba(196,88,42,0.1)', color: 'var(--rust)',
                            padding: '0.2rem 0.5rem', borderRadius: '2px',
                            border: '1px solid rgba(196,88,42,0.2)',
                            fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', fontWeight: 700,
                        }}>
                            <Flame size={11} />
                            {debate.rating || 0} Rating
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.2rem 0.5rem', borderRadius: '2px',
                            fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', fontWeight: 700,
                            ...(isClosed
                                ? { background: 'var(--surf)', color: 'var(--sub)', border: '1px solid var(--bdr)' }
                                : { background: 'rgba(106,76,147,0.12)', color: 'var(--violet-lt)', border: '1px solid rgba(106,76,147,0.25)' }
                            )
                        }}>
                            <Clock size={11} />
                            {isClosed ? 'Closed' : `${diffDays}d Left`}
                        </div>
                        {!isClosed && userId === debate.creator_id && (
                            <CloseDebateButton debateId={debate.id} userId={userId} />
                        )}
                    </div>

                    {/* Topic */}
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2, marginBottom: '0.6rem' }}>
                        {debate.topic}
                    </h2>

                    {/* Participants */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", paddingBottom: '0.75rem', borderBottom: '1px solid var(--bdr)', marginBottom: '0.75rem' }}>
                        <Users size={12} /> {comments?.length || 0} Participants
                    </div>

                    {/* FOR vs AGAINST */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ background: 'rgba(106,76,147,0.08)', padding: '0.75rem', borderRadius: '2px', border: '1px solid rgba(106,76,147,0.2)', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet-lt)' }}>
                                FOR ({displayForScore}%)
                            </div>
                        </div>
                        <div style={{ background: 'rgba(196,88,42,0.08)', padding: '0.75rem', borderRadius: '2px', border: '1px solid rgba(196,88,42,0.2)', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rust)' }}>
                                AGAINST ({displayAgainstScore}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thread */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem', padding: '0 2px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sub)', textAlign: 'center', paddingBottom: '0.5rem', opacity: 0.6 }}>
                    Live Arguments
                </div>

                {/* Eureka welcome */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{
                        background: 'var(--card)',
                        border: '1px solid var(--bdr)',
                        borderRadius: '2px',
                        padding: '1rem',
                        maxWidth: '95%',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--violet), var(--violet-lt))', opacity: 0.7 }} />
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--violet-lt)', marginBottom: '0.5rem', fontWeight: 700 }}>
                            Eureka System
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--sub)', lineHeight: 1.65 }}>
                            Welcome to the Arena. The topic is{' '}
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>"{debate.topic}"</span>.
                            <br /><br />
                            {debate.introduction && (
                                <div style={{
                                    textAlign: 'left',
                                    background: 'var(--surf)',
                                    borderRadius: '2px',
                                    padding: '0.65rem',
                                    margin: '0 0 0.65rem',
                                    border: '1px solid var(--bdr)',
                                    fontSize: '0.72rem',
                                }}>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
                                        Debate Context
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--sub)', lineHeight: 1.6 }}>
                                        <RichText content={debate.introduction} small />
                                    </div>
                                </div>
                            )}
                            Logical integrity is required. Unsubstantiated claims will be penalized, and factual logic will be rewarded. Make the first move to earn Reputation Points!
                        </div>
                    </div>
                </div>

                {/* Comment Bubbles */}
                {comments?.map((comment: any) => {
                    const isMe = userId === comment.author_id
                    return (
                        <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '0.25rem', alignItems: isMe ? 'flex-start' : 'flex-end' }}>
                            {/* Parent reply context */}
                            {comment.parent_id && (
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    margin: '0 0.5rem 0.25rem',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '2px',
                                    borderLeft: `3px solid ${isMe ? 'var(--rust)' : 'var(--sub)'}`,
                                    background: isMe ? 'rgba(196,88,42,0.06)' : 'rgba(255,255,255,0.03)',
                                    maxWidth: '75%',
                                    fontSize: '0.65rem',
                                    opacity: 0.85,
                                }}>
                                    <div style={{ fontWeight: 700, color: isMe ? 'var(--rust)' : 'var(--sub)', fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', marginBottom: '0.1rem' }}>
                                        {comments.find((c: any) => c.id === comment.parent_id)?.users?.clerk_username || 'Participant'}
                                    </div>
                                    <div style={{ color: 'var(--sub)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        {comments.find((c: any) => c.id === comment.parent_id)?.content || 'Original message removed'}
                                    </div>
                                </div>
                            )}

                            {/* Bubble */}
                            <div style={{
                                position: 'relative',
                                maxWidth: '92%',
                                borderRadius: '2px',
                                padding: '0.65rem',
                                ...(isMe
                                    ? {
                                        background: 'rgba(196,88,42,0.07)',
                                        border: '1px solid rgba(196,88,42,0.2)',
                                        borderTopLeftRadius: 0,
                                    }
                                    : {
                                        background: 'rgba(106,76,147,0.07)',
                                        border: '1px solid rgba(106,76,147,0.18)',
                                        borderTopRightRadius: 0,
                                    }
                                )
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem', gap: '0.75rem' }}>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        {comment.users?.clerk_username || 'Unknown User'}
                                        <span style={{
                                            fontSize: '0.44rem', padding: '0.1rem 0.35rem', borderRadius: '2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                            ...(comment.stance === 'for'
                                                ? { background: 'rgba(106,76,147,0.15)', color: 'var(--violet-lt)' }
                                                : { background: 'rgba(196,88,42,0.15)', color: 'var(--rust)' }
                                            )
                                        }}>
                                            {comment.stance}
                                        </span>
                                    </div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.44rem', color: 'var(--sub)', whiteSpace: 'nowrap', marginTop: '0.1rem', opacity: 0.7 }}>
                                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0.5rem' }}>
                                    <RichText content={comment.content} small />
                                </div>

                                <DebateCommentActions
                                    comment={comment}
                                    debateId={debate.id}
                                    userId={userId}
                                    isClosed={isClosed}
                                />

                                {comment.eureka_points_awarded > 0 && (
                                    <div style={{
                                        marginTop: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                        background: 'rgba(106,76,147,0.1)', color: 'var(--violet-lt)',
                                        fontSize: '0.5rem', fontFamily: "'DM Mono', monospace", fontWeight: 700,
                                        padding: '0.2rem 0.5rem', borderRadius: '2px', width: '100%',
                                    }}>
                                        +{comment.eureka_points_awarded} Rep Points (Verified)
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Anchored Input */}
            <div style={{ position: 'fixed', bottom: '65px', left: 0, right: 0, zIndex: 40, padding: '0 0.5rem 0.5rem' }}>
                <div style={{ maxWidth: '42rem', margin: '0 auto', width: '100%' }}>
                    {!isClosed ? (
                        <CreateCommentForm debateId={debate.id} />
                    ) : (
                        <div style={{
                            background: 'var(--surf)', borderRadius: '2px', padding: '1rem', textAlign: 'center',
                            border: '1px solid var(--bdr)',
                            fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: 'var(--sub)', letterSpacing: '0.08em',
                        }}>
                            This debate is sealed.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
