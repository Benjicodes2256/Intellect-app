"use client"

import { useState, useEffect } from 'react'
import { User, MapPin, Briefcase, Award, ShieldAlert, Send } from 'lucide-react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { submitSuggestionAction, fetchUserProfileMetricsAction } from './actions'
import ReputationModal from './components/ReputationModal'
import { REPUTATION_TIERS } from '@/lib/reputation'

export default function ProfilePage() {
    const { isLoaded, user } = useUser()
    const [suggestion, setSuggestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [metrics, setMetrics] = useState<any>(null)
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)

    useEffect(() => {
        if (isLoaded && user) {
            fetchUserProfileMetricsAction().then((data) => {
                setMetrics(data)
                setIsLoadingMetrics(false)
            }).catch((err) => {
                console.error(err)
                setIsLoadingMetrics(false)
            })
        }
    }, [isLoaded, user])

    if (!isLoaded || !user || isLoadingMetrics) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', letterSpacing: '0.08em' }}>
                Loading profile...
            </div>
        )
    }

    const handleSuggestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!suggestion.trim()) return
        setIsSubmitting(true)
        try {
            await submitSuggestionAction(suggestion)
            alert('Your suggestion has been securely sent to the Admin Inbox!')
            setSuggestion('')
        } catch (error: any) {
            alert(error.message || 'Failed to submit suggestion.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block', flexShrink: 0 }} />
                        Identity
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'var(--fs-xl)', fontWeight: 900, color: 'var(--text)', lineHeight: 0.95 }}>
                        Pro<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>file</em>
                    </h1>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--sub)', marginTop: '0.5rem' }}>
                        Manage your identity and track your logic.
                    </p>
                </div>
                <SignOutButton>
                    <button style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 'var(--fs-xs)',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--sub)',
                        background: 'var(--surf)',
                        border: '1px solid var(--bdr)',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                    }}>
                        Sign Out
                    </button>
                </SignOutButton>
            </div>

            {/* User Card */}
            <div style={{ background: 'var(--card)', padding: '1.25rem', borderRadius: '2px', border: '1px solid var(--bdr)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <img
                        src={user.imageUrl}
                        alt="Profile Avatar"
                        style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--gold)', flexShrink: 0 }}
                    />
                    <div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                            {user.fullName || "Intellectual User"}
                        </h2>
                        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", marginTop: '0.1rem' }}>
                            @{user.username || user.firstName?.toLowerCase() || 'user'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    {[
                        { Icon: User, text: user.primaryEmailAddress?.emailAddress },
                        { Icon: MapPin, text: 'Earth (Location pending)' },
                        { Icon: Briefcase, text: 'Professional Thinker' },
                    ].map(({ Icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--fs-sm)', color: 'var(--sub)' }}>
                            <Icon size={14} style={{ color: 'var(--rust)', flexShrink: 0 }} />
                            {text}
                        </div>
                    ))}
                </div>

                {/* Reputation Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr)' }}>
                    {/* Reputation Tier */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ textAlign: 'left', background: 'rgba(106,76,147,0.08)', padding: '0.85rem', borderRadius: '2px', border: '1px solid rgba(106,76,147,0.2)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(106,76,147,0.12)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(106,76,147,0.08)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--violet-lt)' }}>Reputation Tier</span>
                            <Award size={14} style={{ color: 'var(--violet-lt)' }} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                            {metrics?.calculatedTier?.tierName || 'Observer'}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', color: 'var(--sub)', marginBottom: '0.3rem' }}>
                                <span>{metrics?.calculatedTier?.reputationScore || 0} PTS</span>
                                <span>{metrics?.calculatedTier?.isMax ? 'MAX TIER' : `${metrics?.calculatedTier?.pointsToNext || 0} TO NEXT`}</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--bdr)', borderRadius: '1px', height: '3px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--violet)', height: '100%', width: `${metrics?.calculatedTier?.progressPercentage || 0}%`, transition: 'width 0.5s' }} />
                            </div>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', color: 'var(--sub)', marginTop: '0.4rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                                {metrics?.calculatedTier?.isMax
                                    ? "You have reached the Zenith."
                                    : `"Keep commenting to reach ${REPUTATION_TIERS[(metrics?.calculatedTier?.tierIndex || 0) + 1]} status."`}
                            </p>
                        </div>
                    </button>

                    {/* Truth Score */}
                    <div style={{ background: 'rgba(196,88,42,0.08)', padding: '0.85rem', borderRadius: '2px', border: '1px solid rgba(196,88,42,0.2)', opacity: 0.6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rust)' }}>Truth Score</span>
                            <ShieldAlert size={14} style={{ color: 'var(--rust)' }} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: 'var(--fs-xs)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', color: 'var(--rust)', lineHeight: 1.2 }}>[COMING SOON]</span>
                        </div>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', color: 'var(--sub)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                            The Eureka AI will soon begin evaluating logical consistency to form your Truth Score.
                        </p>
                    </div>
                </div>
            </div>

            {/* Suggestion Box */}
            <form
                onSubmit={handleSuggestionSubmit}
                className="tour-suggestion-box"
                style={{ background: 'var(--card)', padding: '1.25rem', borderRadius: '2px', border: '1px solid var(--bdr)', marginBottom: '2rem' }}
            >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'var(--fs-base)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Send size={16} style={{ color: 'var(--sub)' }} />
                    Send a Suggestion
                </h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', marginBottom: '0.85rem' }}>
                    Have an idea to improve the platform? Send it directly to Admin.
                </p>

                <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="I think we should add..."
                    required
                    style={{
                        width: '100%',
                        background: 'var(--surf)',
                        border: '1px solid var(--bdr)',
                        borderRadius: '2px',
                        padding: '0.65rem',
                        fontSize: 'var(--fs-base)',
                        color: 'var(--text)',
                        minHeight: '100px',
                        resize: 'vertical',
                        marginBottom: '0.75rem',
                        outline: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        boxSizing: 'border-box',
                        opacity: isSubmitting ? 0.5 : 1,
                    }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            background: 'var(--violet)',
                            color: '#fff',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: 'var(--fs-sm)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            padding: '0.5rem 1.25rem',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.6 : 1,
                            boxShadow: '0 0 20px rgba(106,76,147,0.3)',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {isSubmitting ? 'Sending...' : 'Submit Suggestion'}
                    </button>
                </div>
            </form>

            {metrics && (
                <ReputationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    currentTierIndex={metrics.calculatedTier.tierIndex}
                    reputationScore={metrics.calculatedTier.reputationScore}
                    nextTierTarget={metrics.calculatedTier.nextTierTarget}
                    tierDemotions={metrics.calculatedTier.tierDemotions}
                />
            )}
        </div>
    )
}
