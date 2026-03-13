"use client"

import { useState } from 'react'
import { clsx } from 'clsx'
import { createPostAction } from '../actions'
import RichText from '@/components/ui/RichText'

export default function CreatePostForm() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [postContent, setPostContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!postContent.trim()) return

        setIsSubmitting(true)
        try {
            await createPostAction(postContent)
            setPostContent('')
            setIsCreateModalOpen(false)
            // No alert needed since UI optimistically refreshes via Server Action revalidatePath
        } catch (error: any) {
            alert(error.message || "Failed to create post")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#0055ff] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors shadow-sm"
            >
                Post Thought
            </button>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-[#0055ff] mb-4">Share an Insight</h2>

                        <form onSubmit={handleCreatePost}>
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Your Insight</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(false)}
                                            className={clsx(
                                                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                !showPreview ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className={clsx(
                                                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                showPreview ? "bg-white text-[#0055ff] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    {showPreview ? (
                                        <div className="w-full h-32 p-3 border border-blue-100 bg-blue-50/20 rounded-xl overflow-y-auto">
                                            {postContent ? (
                                                <RichText content={postContent} />
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No content to preview.</p>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea
                                            value={postContent}
                                            onChange={(e) => setPostContent(e.target.value)}
                                            placeholder="What profound thought is on your mind?"
                                            className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0055ff] resize-none text-sm text-gray-900"
                                            disabled={isSubmitting}
                                            required
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff5500] hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Posting..." : "Publish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
