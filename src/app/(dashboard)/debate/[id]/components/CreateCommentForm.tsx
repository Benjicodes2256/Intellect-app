"use client"

import { useState } from 'react'
import { Send } from 'lucide-react'
import { clsx } from 'clsx'
import { createCommentAction } from '../actions'
import Editor from '@/components/ui/Editor'

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

                {/* Compact Argument Editor */}
                <div className="flex-1 relative w-full bg-white rounded-[24px] border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-[#0055ff]/10 transition-all">
                    <Editor 
                        value={content} 
                        onChange={setContent}
                        placeholder="State your argument..."
                        minHeight="60px"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="absolute right-2 bottom-2 bg-[#ff5500] hover:bg-[#cc4400] text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:bg-[#ff5500]"
                        title="Send Argument"
                    >
                        <Send size={16} className="ml-[1px]" />
                    </button>
                </div>
            </div>
        </form>
    )
}
