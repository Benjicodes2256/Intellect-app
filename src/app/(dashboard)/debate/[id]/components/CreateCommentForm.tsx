"use client"

import { useState, useEffect } from 'react'
import { Send, X } from 'lucide-react'
import { clsx } from 'clsx'
import { createCommentAction } from '../actions'
import Editor from '@/components/ui/Editor'

export default function CreateCommentForm({ debateId }: { debateId: string }) {
    const [stance, setStance] = useState<'for' | 'against'>('for')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [replyingTo, setReplyingTo] = useState<{ commentId: string, authorName: string, content: string } | null>(null)

    useEffect(() => {
        const handleReplyEvent = ((e: CustomEvent<{ debateId: string, commentId: string, authorName: string, content: string }>) => {
            if (e.detail.debateId === debateId) {
                setReplyingTo(e.detail);
            }
        }) as EventListener;

        window.addEventListener('inlineDebateReplyRequested', handleReplyEvent);
        return () => window.removeEventListener('inlineDebateReplyRequested', handleReplyEvent);
    }, [debateId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            const result = await createCommentAction(debateId, content, stance, replyingTo?.commentId)
            if (result?.error) {
                alert(result.error)
                return
            }
            setContent('')
            setReplyingTo(null)
        } catch (error: any) {
            alert(error.message || "Failed to submit comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#0055ff]/10 transition-all">
                {replyingTo && (
                    <div className="flex justify-between items-start bg-black/5 mx-2 mt-2 p-2 px-3 rounded-lg border-l-4 border-[#ff5500] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex flex-col overflow-hidden w-full pr-2">
                            <div className="text-[10px] font-bold text-[#ff5500] uppercase tracking-wider">
                                Replying to {replyingTo.authorName}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-0.5 opacity-80">
                                {replyingTo.content}
                            </div>
                        </div>
                        <button type="button" onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 shrink-0 bg-black/5 hover:bg-black/10 rounded-full" title="Cancel Reply">
                            <X size={12} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-end gap-2 p-1">
                    {/* Compact Stance Selector */}
                    <div className="flex w-full sm:w-auto p-0.5 bg-gray-100/80 rounded-full shrink-0 border border-gray-200 mb-1 sm:mb-0 ml-1">
                        <button
                            type="button"
                            onClick={() => setStance('for')}
                            className={clsx(
                                "flex-1 sm:flex-none px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                                stance === 'for' ? "bg-white text-[#0055ff] shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Agree
                        </button>
                        <button
                            type="button"
                            onClick={() => setStance('against')}
                            className={clsx(
                                "flex-1 sm:flex-none px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                                stance === 'against' ? "bg-white text-[#ff5500] shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Disagree
                        </button>
                    </div>

                    {/* Compact Argument Editor */}
                    <div className="flex-1 relative w-full bg-transparent border-none">
                        <Editor
                            value={content}
                            onChange={setContent}
                            placeholder={replyingTo ? "State your counterargument..." : "State your argument..."}
                            minHeight="60px"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="absolute right-2 bottom-2 bg-[#ff5500] hover:bg-[#cc4400] text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:bg-[#ff5500] z-10"
                            title="Send Argument"
                        >
                            <Send size={16} className="ml-[1px]" />
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
