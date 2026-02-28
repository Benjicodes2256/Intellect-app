"use client"

import { useState } from 'react'
import { Send } from 'lucide-react'
import { clsx } from 'clsx'
import { createCommentAction } from '../actions'

export default function CreateCommentForm({ debateId }: { debateId: string }) {
    const [stance, setStance] = useState<'for' | 'against'>('for')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            // Top level argument, no parentId
            const result = await createCommentAction(debateId, content, stance)
            if (result?.error) {
                alert(result.error)
                return
            }
            setContent('')
        } catch (error: any) {
            alert(error.message || "Failed to submit comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Compact Stance Selector */}
                <div className="flex w-full sm:w-auto p-0.5 bg-gray-100/80 rounded-full shrink-0 border border-gray-200">
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

                {/* Single Line Input */}
                <div className="flex-1 relative w-full">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="State your argument..."
                        className="w-full bg-gray-100/80 border border-gray-200 focus:border-[#0055ff]/40 rounded-full px-4 py-2 pr-10 text-sm outline-none transition-colors"
                        disabled={isSubmitting}
                        required
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0055ff] hover:bg-blue-600 text-white p-1.5 rounded-full transition-colors disabled:opacity-50 disabled:bg-gray-300"
                        title="Send Argument"
                    >
                        <Send size={14} className="ml-[1px]" />
                    </button>
                </div>
            </div>
        </form>
    )
}
