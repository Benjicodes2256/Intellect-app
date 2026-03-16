"use client"

import { useState, useEffect } from 'react'
import { Send, X } from 'lucide-react'
import { createPostCommentAction } from '../actions'

export default function InlineCommentForm({ postId }: { postId: string }) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, authorName: string, content: string } | null>(null)

    useEffect(() => {
        // We namespace the event to the specific post so multiple open threads don't clash
        const handleReplyEvent = ((e: CustomEvent<{ postId: string, commentId: string, authorName: string, content: string }>) => {
            if (e.detail.postId === postId) {
                setReplyingTo(e.detail);
            }
        }) as EventListener;

        window.addEventListener('inlineReplyRequested', handleReplyEvent);
        return () => window.removeEventListener('inlineReplyRequested', handleReplyEvent);
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await createPostCommentAction(postId, content, replyingTo?.commentId)
            setContent('')
            setReplyingTo(null)
        } catch (error: any) {
            alert(error.message || "Failed to submit comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    const cancelReply = () => setReplyingTo(null)

    return (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[var(--bdr)]">
            <div className="flex flex-col relative bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--gold)]/20 focus-within:border-[var(--gold)] transition-all">

                {replyingTo && (
                    <div className="flex justify-between items-start bg-black/20 mx-2 mt-2 p-2 px-3 rounded-lg border-l-4 border-[var(--gold)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col overflow-hidden w-full pr-2">
                            <div className="text-xs font-bold text-[var(--gold)] font-mono uppercase tracking-wider">
                                {replyingTo.authorName}
                            </div>
                            <div className="text-xs text-[var(--sub)] truncate mt-0.5 opacity-90 italic">
                                "{replyingTo.content.replace(/<[^>]*>?/gm, '')}"
                            </div>
                        </div>
                        <button type="button" onClick={cancelReply} className="text-[var(--sub)] hover:text-[var(--text)] transition-colors p-1 shrink-0 bg-black/5 hover:bg-black/10 rounded-full" title="Cancel Reply">
                            <X size={12} />
                        </button>
                    </div>
                )}

                <div className="flex gap-2 items-end relative w-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={replyingTo ? "Write your reply..." : "Add to the discussion..."}
                        className="w-full min-h-[40px] max-h-[120px] p-3 pr-12 bg-transparent border-transparent focus:ring-0 focus:border-transparent outline-none resize-y text-xs text-[var(--text)] transition-all"
                        disabled={isSubmitting}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="absolute right-2 bottom-2 bg-[var(--gold)] hover:bg-[var(--rust)] text-black hover:text-white p-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        title="Send Message"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </form>
    )
}
