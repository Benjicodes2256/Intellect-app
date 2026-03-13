import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Info } from 'lucide-react'
import InboxMessageCard from './components/InboxMessageCard'

function CharterBanner() {
    return (
        <div style={{
            background: 'var(--surf)',
            padding: '1rem',
            borderRadius: '2px',
            border: '1px solid var(--bdr)',
            borderLeft: '3px solid var(--gold)',
            marginBottom: '1.25rem',
        }}>
            <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.75rem',
            }}>
                <Info size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                🏛️ The iNTELlect Community Charter
            </h3>

            <ul style={{
                fontSize: '0.72rem',
                color: 'var(--sub)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--bdr)',
                listStyle: 'none',
                padding: '0.75rem 0 0 0',
                margin: 0,
            }}>
                <li><strong style={{ color: 'var(--text)' }}>Attack the Idea, Not the Person:</strong> All debates must focus on the logic. Personal attacks result in removal.</li>
                <li><strong style={{ color: 'var(--text)' }}>The "Logic Point" Rule:</strong> Every comment should add value. Avoid "fluff".</li>
                <li><strong style={{ color: 'var(--text)' }}>No Vulgarity or Profanity:</strong> iNTELlect is a professional utility.</li>
                <li><strong style={{ color: 'var(--text)' }}>Zero Tolerance for Threats:</strong> Threats result in a permanent account ban.</li>
                <li><strong style={{ color: 'var(--text)' }}>Hate Speech:</strong> Strict bans filter hate or discrimination.</li>
                <li><strong style={{ color: 'var(--text)' }}>Fact-Check Bounties:</strong> Verify a claim = Reputation Points.</li>
            </ul>
        </div>
    )
}

import PWAAnnouncement from './components/PWAAnnouncement'

export default async function InboxPage() {
    const { userId, getToken } = await auth()
    if (!userId) redirect('/sign-in')

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender_users:users!messages_sender_id_fkey(clerk_username, role),
            receiver_users:users!messages_receiver_id_fkey(clerk_username, role)
        `)
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
        .order('created_at', { ascending: false })

    if (error) console.error(error)

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block', flexShrink: 0 }} />
                    Direct Messages
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 0.95 }}>
                    In<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>box</em>
                </h1>
                <p style={{ fontSize: '0.72rem', color: 'var(--sub)', marginTop: '0.5rem' }}>
                    Direct messages self-destruct after 5 days automatically.
                </p>
            </div>

            <CharterBanner />

            <PWAAnnouncement />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {messages?.length === 0 && (
                    <div style={{
                        textAlign: 'center', fontSize: '0.8rem', color: 'var(--sub)',
                        padding: '2.5rem', background: 'var(--card)',
                        border: '1px dashed var(--bdr)', borderRadius: '2px', marginTop: '0.5rem',
                    }}>
                        Your inbox is empty. Start a conversation on the Feed or in a Debate!
                    </div>
                )}

                {messages?.map(msg => (
                    <InboxMessageCard key={msg.id} msg={msg} currentUserId={userId} />
                ))}

                {messages && messages.length > 0 && (
                    <div style={{ textAlign: 'center', fontSize: '0.58rem', color: 'var(--sub)', padding: '1.5rem 0', borderTop: '1px solid var(--bdr)', marginTop: '0.5rem', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                        No more messages. Time to dive back into a debate!
                    </div>
                )}
            </div>
        </div>
    )
}
