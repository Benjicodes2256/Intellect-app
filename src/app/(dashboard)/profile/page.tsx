"use client"

import { useState } from 'react'
import { User, MapPin, Briefcase, Award, ShieldAlert, Send } from 'lucide-react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { submitSuggestionAction } from './actions'

const REPUTATION_TIERS = ['Apprentice', 'Rookie', 'Pro', 'Scholar', 'Einstein']

export default function ProfilePage() {
    const { isLoaded, user } = useUser()
    const [suggestion, setSuggestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isLoaded || !user) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                Loading profile...
            </div>
        )
    }

    const mockDbUser = {
        reputationScore: 45,
        truthScore: 98,
        tier: REPUTATION_TIERS[1],
        nextTierTarget: 100,
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

    const progressPercentage = (mockDbUser.reputationScore / mockDbUser.nextTierTarget) * 100

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block', flexShrink: 0 }} />
                        Identity
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 0.95 }}>
                        Pro<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>file</em>
                    </h1>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sub)', marginTop: '0.5rem' }}>
                        Manage your identity and track your logic.
                    </p>
                </div>
                <SignOutButton>
                    <button style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.52rem',
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
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                            {user.fullName || "Intellectual User"}
                        </h2>
                        <p style={{ fontSize: '0.68rem', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", marginTop: '0.1rem' }}>
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
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--sub)' }}>
                            <Icon size={14} style={{ color: 'var(--rust)', flexShrink: 0 }} />
                            {text}
                        </div>
                    ))}
                </div>

                {/* Reputation Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--bdr)' }}>
                    {/* Reputation Tier */}
                    <div style={{ background: 'rgba(106,76,147,0.08)', padding: '0.85rem', borderRadius: '2px', border: '1px solid rgba(106,76,147,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--violet-lt)' }}>Reputation Tier</span>
                            <Award size={14} style={{ color: 'var(--violet-lt)' }} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                            {mockDbUser.tier}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Mono', monospace", fontSize: '0.44rem', color: 'var(--sub)', marginBottom: '0.3rem' }}>
                                <span>{mockDbUser.reputationScore} PTS</span>
                                <span>{mockDbUser.nextTierTarget} TO NEXT</span>
                            </div>
                            <div style={{ width: '100%', background: 'var(--bdr)', borderRadius: '1px', height: '3px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--violet)', height: '100%', width: `${progressPercentage}%`, transition: 'width 0.5s' }} />
                            </div>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', color: 'var(--sub)', marginTop: '0.4rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                                "One more verified fact-check and you'll reach {REPUTATION_TIERS[2]} status."
                            </p>
                        </div>
                    </div>

                    {/* Truth Score */}
                    <div style={{ background: 'rgba(196,88,42,0.08)', padding: '0.85rem', borderRadius: '2px', border: '1px solid rgba(196,88,42,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rust)' }}>Truth Score</span>
                            <ShieldAlert size={14} style={{ color: 'var(--rust)' }} />
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                            {mockDbUser.truthScore}%
                        </div>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', color: 'var(--sub)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                            Posting unverified claims lowers this. Drops below 80% restrict your ability to start Master Debates.
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
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Send size={16} style={{ color: 'var(--sub)' }} />
                    Send a Suggestion
                </h3>
                <p style={{ fontSize: '0.68rem', color: 'var(--sub)', marginBottom: '0.85rem' }}>
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
                        fontSize: '0.8rem',
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
                            fontSize: '0.75rem',
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
        </div>
    )
}
