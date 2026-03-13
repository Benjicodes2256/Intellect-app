"use client"

import { useState } from 'react'
import { Reply, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { sendMessageAction } from '../actions'
import DeleteMessageButton from './DeleteMessageButton'

export default function InboxMessageCard({ msg, currentUserId }: { msg: any, currentUserId: string }) {
    const [replyOpen, setReplyOpen] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isSending, setIsSending] = useState(false)

    // Using populated relationship user records.
    // Ensure we handle both directions (received or sent messages).
    const isSentByMe = msg.sender_id === currentUserId
    const displayUser = isSentByMe ? msg.receiver_users : msg.sender_users
    const displayUsername = displayUser?.clerk_username || 'Unknown User'

    // We only consider it "unread" if we received it.
    const isUnread = (!msg.read && !isSentByMe)

    const isModerator = displayUsername.includes('Eureka') || displayUsername.includes('Admin')

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        setIsSending(true)
        try {
            // If I am replying, I send to whoever sent me this message.
            const targetReceiverId = isSentByMe ? msg.receiver_id : msg.sender_id
            await sendMessageAction(targetReceiverId, replyContent)
            setReplyContent('')
            setReplyOpen(false)
            alert("Message sent.")
        } catch (error: any) {
            alert(error.message || "Failed to send reply")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div style={{
            background: 'var(--card)',
            borderRadius: '2px',
            border: '1px solid var(--bdr)',
            padding: '1rem',
            marginBottom: '0.75rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            ...(isUnread && {
                borderLeft: '3px solid var(--rust)',
                background: 'rgba(196,88,42,0.03)'
            }),
            ...(isSentByMe && {
                background: 'rgba(255,255,255,0.02)',
                opacity: 0.9
            })
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 'var(--fs-xs)',
                        background: isModerator
                            ? 'linear-gradient(135deg, var(--rust), var(--gold))'
                            : 'linear-gradient(135deg, var(--violet), var(--rust))',
                        flexShrink: 0,
                    }}>
                        {displayUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {isSentByMe ? <span style={{ color: 'var(--sub)', fontSize: 'var(--fs-xs)', fontWeight: 400 }}>To:</span> : null}
                            {displayUsername}
                            {isModerator && (
                                <span style={{ background: 'var(--rust)', color: '#fff', fontSize: 'var(--fs-xs)', padding: '0.15rem 0.4rem', borderRadius: '2px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>System</span>
                            )}
                        </div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--sub)', fontFamily: "'DM Mono', monospace" }}>
                            {new Date(msg.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <DeleteMessageButton messageId={msg.id} />
            </div>

            <div style={{ fontSize: 'var(--fs-base)', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem', paddingLeft: '2.5rem', whiteSpace: 'pre-wrap' }}>
                {msg.content}
            </div>

            {!isModerator && !isSentByMe && (
                <div style={{ paddingLeft: '2.5rem', borderTop: '1px dashed var(--bdr)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    {!replyOpen ? (
                        <button
                            onClick={() => setReplyOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                fontFamily: "'DM Mono', monospace", color: 'var(--gold)', background: 'none', border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Reply size={14} /> Reply
                        </button>
                    ) : (
                        <form onSubmit={handleReply} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                disabled={isSending}
                                placeholder={`Reply to ${displayUsername}...`}
                                style={{
                                    flex: 1, fontSize: 'var(--fs-sm)', background: 'var(--surf)',
                                    border: '1px solid var(--bdr)', borderRadius: '2px',
                                    padding: '0.5rem 0.75rem', color: 'var(--text)', outline: 'none'
                                }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSending}
                                style={{
                                    background: 'var(--violet)', color: '#fff',
                                    padding: '0 1rem', borderRadius: '2px', border: 'none',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: isSending ? 0.5 : 1
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
