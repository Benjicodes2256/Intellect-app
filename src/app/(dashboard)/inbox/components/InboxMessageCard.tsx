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
            "bg-white rounded-xl shadow-sm border p-4 transition-all mb-3 relative overflow-hidden",
            isUnread ? "border-l-4 border-l-[#ff5500] border-y-gray-100 border-r-gray-100" : "border-gray-100",
            isSentByMe && "bg-gray-50/50" // Slight tint for messages we sent
        )}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs",
                        isModerator ? "bg-gradient-to-tr from-gray-900 to-gray-700" : "bg-gradient-to-tr from-[#0055ff] to-[#ff5500]"
                    )}>
                        {displayUsername.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                            {isSentByMe ? <span className="text-gray-400 text-xs font-normal mr-1">To:</span> : null}
                            {displayUsername}
                            {isModerator && <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">System</span>}
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                            {new Date(msg.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <DeleteMessageButton messageId={msg.id} />
            </div>

            <div className="text-sm text-gray-800 leading-relaxed mb-4 pl-10 whitespace-pre-wrap">
                {msg.content}
            </div>

            {!isModerator && !isSentByMe && (
                <div className="pl-10 border-t border-gray-100 pt-3 mt-3">
                    {!replyOpen ? (
                        <button
                            onClick={() => setReplyOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#0055ff] hover:text-blue-800 transition-colors"
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
                                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/10 transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSending}
                                className="bg-[#0055ff] text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
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
