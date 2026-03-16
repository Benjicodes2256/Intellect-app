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
        <div className={clsx(
            "bg-[var(--card)] rounded-xl shadow-sm border p-4 transition-all mb-3 relative overflow-hidden",
            isUnread ? "border-l-4 border-l-[var(--gold)] border-y-[var(--bdr)] border-r-[var(--bdr)]" : "border-[var(--bdr)]",
            isSentByMe && "bg-[var(--surf)]" // Solid tint for messages we sent
        )}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner",
                        isModerator ? "bg-gradient-to-tr from-gray-900 to-gray-700" : "bg-gradient-to-tr from-[var(--violet)] to-[var(--rust)]"
                    )}>
                        {displayUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-[var(--text)] flex items-center gap-1">
                            {isSentByMe ? <span className="text-[var(--sub)] text-xs font-normal mr-1">To:</span> : null}
                            {displayUsername}
                            {isModerator && <span className="bg-[var(--gold)] text-black text-[10px] px-1.5 py-0.5 rounded-sm font-bold">System</span>}
                        </div>
                        <div className="text-xs text-[var(--sub)] mb-1 font-mono">
                            {new Date(msg.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <DeleteMessageButton messageId={msg.id} />
            </div>

            <div className="text-sm text-[var(--text)] leading-relaxed mb-4 pl-10 whitespace-pre-wrap">
                {msg.content}
            </div>

            {!isModerator && !isSentByMe && (
                <div className="pl-10 border-t border-[var(--bdr)] pt-3 mt-3">
                    {!replyOpen ? (
                        <button
                            onClick={() => setReplyOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:text-[var(--rust)] transition-colors"
                        >
                            <Reply size={14} /> Reply
                        </button>
                    ) : (
                        <form onSubmit={handleReply} className="mt-2 flex gap-2 w-full animate-in slide-in-from-top-2 duration-300">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                disabled={isSending}
                                placeholder={`Reply to ${displayUsername}...`}
                                className="flex-1 text-sm border border-[var(--bdr)] rounded-lg px-3 py-2 bg-[var(--surf)] text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSending}
                                className="bg-[var(--gold)] text-black px-3 py-2 rounded-lg hover:bg-[var(--rust)] hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
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
