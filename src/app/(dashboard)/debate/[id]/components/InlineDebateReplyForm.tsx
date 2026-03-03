"use client"

import { useState } from 'react'
import { Send, CornerDownRight, X } from 'lucide-react'
import { clsx } from 'clsx'
import { createCommentAction } from '../actions'

interface InlineDebateReplyFormProps {
    debateId: string
    parentId: string
    parentAuthorName: string
    onClose: () => void
}

export default function InlineDebateReplyForm({ debateId, parentId, parentAuthorName, onClose }: InlineDebateReplyFormProps) {
    const [stance, setStance] = useState<'for' | 'against'>('for')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            const result = await createCommentAction(debateId, content, stance, parentId)
            if (result?.error) {
                alert(result.error)
                return
            }
            setContent('')
            onClose()
        } catch (error: any) {
            alert(error.message || "Failed to submit reply")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-gray-500">
                    Replying to {parentAuthorName}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                    <X size={14} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 mt-1">
                {/* Compact Stance Selector */}
                <div className="flex w-full sm:w-auto p-0.5 bg-white rounded-full shrink-0 border border-gray-200">
                    <button
                        type="button"
                        onClick={() => setStance('for')}
                        className={clsx(
                            "flex-1 sm:flex-none px-2 py-1.5 rounded-full text-[10px] font-bold transition-colors",
                            stance === 'for' ? "bg-blue-50 text-[#0055ff] shadow-sm" : "text-gray-400 hover:text-gray-900"
                        )}
                    >
                        Agree
                    </button>
                    <button
                        type="button"
                        onClick={() => setStance('against')}
                        className={clsx(
                            "flex-1 sm:flex-none px-2 py-1.5 rounded-full text-[10px] font-bold transition-colors",
                            stance === 'against' ? "bg-orange-50 text-[#ff5500] shadow-sm" : "text-gray-400 hover:text-gray-900"
                        )}
                    >
                        Disagree
                    </button>
                </div>

                <div className="flex-1 relative w-full">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="State your counterargument..."
                        className="w-full bg-white border border-gray-200 rounded-full px-3 py-1.5 pr-8 focus:ring-2 focus:ring-[#0055ff]/20 focus:border-[#0055ff] placeholder-gray-500 text-gray-900 outline-none text-xs transition-all"
                        disabled={isSubmitting}
                        required
                        autoFocus
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff5500] hover:bg-[#cc4400] text-white p-1 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:bg-[#ff5500]"
                        title="Send Reply"
                    >
                        <Send size={12} className="ml-[1px]" />
                    </button>
                </div>
            </form>
        </div>
    )
}
