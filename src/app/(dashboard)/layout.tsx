import { BottomNav } from '@/components/layout/BottomNav'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import OnboardingTour from '@/components/layout/OnboardingTour'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { calculateReputationTier } from '@/lib/reputation'
import InAppBrowserPrompt from './components/InAppBrowserPrompt'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: userData } = await supabase
        .from('users')
        .select('role, has_completed_onboarding, reputation_score, tier_demotions')
        .eq('clerk_id', userId)
        .single()

    const isAdmin = userData?.role === 'admin'
    const completedOnboarding = userData?.has_completed_onboarding ?? true

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '96px', position: 'relative' }}>
            {/* Top Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                background: 'var(--card)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--bdr)',
                padding: '0 1rem',
                height: '52px',
                display: 'flex',
                alignItems: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '42rem',
                    margin: '0 auto',
                    width: '100%',
                }}>
                    {/* Logo */}
                    <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        color: 'var(--text)',
                    }}>
                        INTEL<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>lect</em>
                    </span>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '0.5rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'var(--rust)',
                                    padding: '0.2rem 0.6rem',
                                    border: '1px solid rgba(196,88,42,0.3)',
                                    borderRadius: '2px',
                                    background: 'rgba(196,88,42,0.08)',
                                    textDecoration: 'none',
                                }}
                            >
                                Admin
                            </Link>
                        )}
                        <div style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.5rem',
                            fontWeight: 500,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--sub)',
                            padding: '0.2rem 0.6rem',
                            border: '1px solid var(--bdr)',
                            borderRadius: '2px',
                            background: 'var(--surf)',
                        }}>
                            {calculateReputationTier(userData?.reputation_score, userData?.tier_demotions).tierName}
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '1.25rem 1rem', width: '100%' }}>
                {children}
            </main>

            <OnboardingTour userId={userId} completedOnboarding={completedOnboarding} />
            <InAppBrowserPrompt />

            {/* Mobile-first bottom navigation */}
            <BottomNav />
        </div>
    )
}
