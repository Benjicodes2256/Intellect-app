import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'
import CreatePostForm from './components/CreatePostForm'
import FeedPostCard from './components/FeedPostCard'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*, users(*), likes(user_id), comments(*, users(*), likes(user_id))')
        .order('created_at', { ascending: false })

    const { data: userData } = await supabase.from('users').select('role').eq('clerk_id', userId).single()
    const isAdmin = userData?.role === 'admin'

    if (error) {
        console.error(error)
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 'var(--fs-xs)', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block', flexShrink: 0 }} />
                        Intellectual Network
                    </div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'var(--fs-xl)', fontWeight: 900, color: 'var(--text)', lineHeight: 0.95 }}>
                        Social<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Feed</em>
                    </h1>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--sub)', marginTop: '0.5rem' }}>
                        Insights, debate summaries, connections.
                    </p>
                </div>
                <CreatePostForm />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {posts?.length === 0 && (
                    <div style={{ textAlign: 'center', fontSize: 'var(--fs-base)', color: 'var(--sub)', padding: '2.5rem', background: 'var(--card)', border: '1px dashed var(--bdr)', borderRadius: '2px' }}>
                        No posts yet. Be the first to share an insight!
                    </div>
                )}

                {posts?.map((post: any) => (
                    <FeedPostCard key={post.id} post={post} currentUserId={userId} isAdmin={isAdmin} />
                ))}

                <div style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--sub)', padding: '1.5rem 0', borderTop: '1px solid var(--bdr)', marginTop: '0.5rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                    You're caught up. Wait for new intellectual inputs.
                </div>
            </div>
        </div>
    )
}
