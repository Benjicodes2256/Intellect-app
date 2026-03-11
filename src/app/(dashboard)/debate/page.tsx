import { Flame, Users, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from '@/lib/supabase/client'
import CreateDebateButton from './components/CreateDebateModal'
import DeleteDebateButton from './components/DeleteDebateButton'
import InviteButton from '@/components/debate/InviteButton'
import RichText from '@/components/ui/RichText'

export const dynamic = 'force-dynamic'

function DebateBar({ scoreFor, scoreAgainst }: { scoreFor: number, scoreAgainst: number }) {
    const total = scoreFor + scoreAgainst;
    const percentageFor = total === 0 ? 50 : Math.round((scoreFor / total) * 100);
    const percentageAgainst = total === 0 ? 50 : Math.round((scoreAgainst / total) * 100);

    return (
        <div style={{
            marginTop: '1rem',
            background: 'var(--surf)',
            padding: '0.75rem',
            borderRadius: '2px',
            border: '1px solid var(--bdr)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
            }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet-lt)' }}>For ({percentageFor}%)</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sub)' }}>Eureka Evaluation</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rust)' }}>Against ({percentageAgainst}%)</span>
            </div>
            <div style={{ height: '3px', width: '100%', background: 'var(--bdr)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', background: 'var(--violet)', transition: 'width 1s', width: `${percentageFor}%` }} />
                <div style={{ height: '100%', background: 'var(--rust)', transition: 'width 1s', width: `${percentageAgainst}%` }} />
            </div>
        </div>
    )
}

function DebateTile({ debate, isOwner }: { debate: any, isOwner: boolean }) {
    const closesAt = new Date(debate.closes_at)
    const now = new Date()
    const diffTime = closesAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isClosed = debate.is_closed || diffDays <= 0

    return (
        <div style={{
            background: 'var(--card)',
            borderRadius: '2px',
            border: '1px solid var(--bdr)',
            padding: '1.25rem',
            marginBottom: '0.75rem',
            transition: 'border-color 0.2s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Rating badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(196,88,42,0.1)', color: 'var(--rust)',
                        padding: '0.2rem 0.5rem', borderRadius: '2px',
                        border: '1px solid rgba(196,88,42,0.2)',
                        fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em',
                    }}>
                        <Flame size={12} />
                        {debate.rating || 0} Rating
                    </div>
                    {/* Status badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.5rem', borderRadius: '2px',
                        fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em',
                        ...(isClosed
                            ? { background: 'var(--surf)', color: 'var(--sub)', border: '1px solid var(--bdr)' }
                            : { background: 'rgba(106,76,147,0.12)', color: 'var(--violet-lt)', border: '1px solid rgba(106,76,147,0.25)' }
                        )
                    }}>
                        <Clock size={12} />
                        {isClosed ? 'Closed' : `${diffDays}d Left`}
                    </div>
                </div>
                {isOwner && <DeleteDebateButton debateId={debate.id} />}
            </div>

            <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem', fontWeight: 700,
                color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.6rem',
            }}>
                {debate.topic}
            </h2>

            {debate.introduction && (
                <div style={{ marginBottom: '0.75rem', borderLeft: '2px solid var(--bdr)', paddingLeft: '0.75rem' }}>
                    <RichText content={debate.introduction} small />
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--sub)', marginBottom: '0.5rem', fontFamily: "'DM Mono', monospace" }}>
                <Users size={12} />
                {debate.comments?.length || 0} Participants · Created by {debate.users?.clerk_username || 'Unknown User'}
            </div>

            <DebateBar
                scoreFor={debate.comments?.filter((c: any) => c.stance === 'for').length || 0}
                scoreAgainst={debate.comments?.filter((c: any) => c.stance === 'against').length || 0}
            />

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                <InviteButton debateId={debate.id} debateTopic={debate.topic} />
                <Link
                    href={`/debate/${debate.id}`}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600,
                        color: 'var(--gold)', border: '1px solid var(--gold)',
                        padding: '0.4rem 0.9rem', borderRadius: '2px',
                        textDecoration: 'none', transition: 'all 0.2s',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}
                >
                    Enter Debate <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    )
}

export default async function DebatePage() {
    const { userId, getToken } = await auth()
    if (!userId) return <div>Please sign in to view debates.</div>

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: debates, error } = await supabase
        .from('debates')
        .select('*, users!debates_creator_id_fkey(clerk_username), comments(id, stance)')
        .order('created_at', { ascending: false })

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block', flexShrink: 0 }} />
                        Intellectual Arena
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 0.95 }}>
                        Master<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Debates</em>
                    </h1>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sub)', marginTop: '0.5rem' }}>
                        Argue with logic, not emotion.
                    </p>
                </div>
                <CreateDebateButton />
            </div>

            {/* Debate list */}
            <div>
                {error && <p style={{ color: 'var(--rust)', fontSize: '0.8rem' }}>Error loading debates: {error.message}</p>}

                {debates?.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--card)', border: '1px dashed var(--bdr)', borderRadius: '2px', fontSize: '0.8rem', color: 'var(--sub)' }}>
                        No active debates found. Be the first to start one!
                    </div>
                )}

                {debates?.map(debate => (
                    <DebateTile
                        key={debate.id}
                        debate={debate}
                        isOwner={debate.creator_id === userId}
                    />
                ))}

                <div style={{ textAlign: 'center', fontSize: '0.58rem', color: 'var(--sub)', padding: '1.5rem 0', borderTop: '1px solid var(--bdr)', marginTop: '1.5rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                    Make sure you have the facts straight.
                </div>
            </div>
        </div>
    )
}
