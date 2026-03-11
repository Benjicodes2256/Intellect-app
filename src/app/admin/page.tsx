import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { BarChart3, Users, MessageSquare, Activity, Flame, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import UserManagementPanel from './components/UserManagementPanel'
import FlaggedContentPanel from './components/FlaggedContentPanel'

export const dynamic = 'force-dynamic'

// Admin page uses service role to bypass RLS for full visibility
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export default async function AdminDashboardPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const supabase = getAdminSupabase()

    // Verify admin
    const { data: userData } = await supabase.from('users').select('role').eq('clerk_id', userId).single()
    if (userData?.role !== 'admin') redirect('/feed')

    // Fetch all data in parallel
    const [usersRes, postsRes, commentsRes, debatesRes, allUsersRes, flaggedRes, recentPostsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('debates').select('*', { count: 'exact', head: true }).eq('is_closed', false),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*, users(clerk_username)').or('is_fluff.eq.true,is_vulgar.eq.true').order('created_at', { ascending: false }),
        supabase.from('posts').select('*, users(clerk_username)').eq('is_eureka_summary', false).order('created_at', { ascending: false }).limit(30),
    ])

    const allUsers = allUsersRes.data || []
    const flaggedComments = flaggedRes.data || []
    const recentPosts = recentPostsRes.data || []

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '6rem' }}>
            <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sub)', fontSize: '0.72rem', marginBottom: '1rem', textDecoration: 'none' }}>
                        <ChevronLeft size={14} /> Back to Feed
                    </Link>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.25rem' }}>
                        INTEL<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>lect</em>{' '}
                        <span style={{ color: 'var(--rust)' }}>Admin</span>
                    </h1>
                    <p style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>Platform metrics, moderation, and user management.</p>
                </div>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Users', value: usersRes.count || 0, icon: <Users size={16} />, color: 'var(--violet-lt)' },
                        { label: 'Total Posts', value: postsRes.count || 0, icon: <Activity size={16} />, color: 'var(--gold)' },
                        { label: 'Total Comments', value: commentsRes.count || 0, icon: <MessageSquare size={16} />, color: 'var(--sub)' },
                        { label: 'Open Debates', value: debatesRes.count || 0, icon: <Flame size={16} />, color: 'var(--rust)' },
                    ].map(stat => (
                        <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--bdr)', borderRadius: '4px', padding: '1rem' }}>
                            <div style={{ color: stat.color, marginBottom: '0.4rem' }}>{stat.icon}</div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sub)', marginTop: '0.25rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Manage Users */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--bdr)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Users size={16} style={{ color: 'var(--violet-lt)' }} />
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Manage Users</h2>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--sub)' }}>Promote to admin, demote, or remove users from the platform.</p>
                    <UserManagementPanel users={allUsers} />
                </div>

                {/* Flagged Content */}
                <div style={{ background: 'var(--card)', border: '1px solid rgba(196,88,42,0.3)', borderRadius: '4px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <BarChart3 size={16} style={{ color: 'var(--rust)' }} />
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Content Moderation</h2>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--sub)' }}>Review flagged comments and delete posts. Actions are irreversible.</p>
                    <FlaggedContentPanel flaggedComments={flaggedComments} recentPosts={recentPosts} />
                </div>

            </div>
        </div>
    )
}
