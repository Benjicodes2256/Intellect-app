"use client"

import { useState } from 'react'
import { Flame } from 'lucide-react'
import { clsx } from 'clsx'
import { createDebateAction } from '../actions'
import RichText from '@/components/ui/RichText'

export default function CreateDebateButton() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [topic, setTopic] = useState('')
    const [context, setContext] = useState('')
    const [introduction, setIntroduction] = useState('')
    const [timeframe, setTimeframe] = useState(1)
    const [isPrivate, setIsPrivate] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [introViewMode, setIntroViewMode] = useState<'edit' | 'preview'>('edit')

    const handleGenerateIntro = async () => {
        if (!topic.trim()) {
            alert("Please enter a Debate Topic first so Eureka knows what to introduce!")
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/eureka/intro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, context })
            })

            const data = await response.json()
            if (!response.ok || data.error) {
                const errorMessage = data.details 
                    ? `${data.error}: ${data.details}` 
                    : (data.error || "Failed to generate introduction.");
                alert(errorMessage)
            } else {
                setIntroduction(data.intro)
                setIntroViewMode('preview')
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred while generating the introduction.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCreateDebate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim()) return

        setIsSubmitting(true)
        try {
            await createDebateAction(topic, timeframe, introduction, isPrivate)
            setTopic('')
            setContext('')
            setIntroduction('')
            setTimeframe(1)
            setIsPrivate(false)
            setIsCreateModalOpen(false)
            alert("Debate successfully launched!")
        } catch (error: any) {
            alert(error.message || "Failed to create debate")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#ff5500] hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1"
            >
                <Flame size={16} /> New Debate
            </button>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold text-[#ff5500] flex items-center gap-2 mb-4">
                            <Flame size={20} /> Host a Master Debate
                        </h2>

                        <form onSubmit={handleCreateDebate}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Debate Topic</label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="State the core argument clearly..."
                                    className="w-full h-20 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff5500] resize-none text-sm text-gray-900"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Context & Sources (Optional)</label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Paste news links or write messy context here. Eureka will summarize it neutrally."
                                    className="w-full h-16 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0055ff] resize-none text-sm text-gray-900"
                                    disabled={isSubmitting || isGenerating}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={handleGenerateIntro}
                                        disabled={isGenerating || isSubmitting}
                                        className="text-xs bg-gradient-to-r from-[#0055ff] to-purple-600 text-white font-bold py-1.5 px-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isGenerating ? "Eureka is Thinking..." : "Generate Intro with Eureka"}
                                    </button>
                                </div>
                            </div>

                            {/* Introduction with Tabbed Swapper */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase text-[#0055ff]">Introduction (Optional)</label>
                                    <div className="flex p-0.5 bg-gray-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setIntroViewMode('edit')}
                                            className={clsx(
                                                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                introViewMode === 'edit' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIntroViewMode('preview')}
                                            className={clsx(
                                                "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                                                introViewMode === 'preview' ? "bg-white text-[#0055ff] shadow-sm" : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                {introViewMode === 'preview' ? (
                                    <div className="w-full h-28 p-3 bg-blue-50/30 border border-blue-200 rounded-xl overflow-y-auto">
                                        {introduction ? (
                                            <RichText content={introduction} small />
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No content to preview.</p>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        value={introduction}
                                        onChange={(e) => setIntroduction(e.target.value)}
                                        placeholder="Manually write an introduction or let Eureka generate one..."
                                        className="w-full h-28 p-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:border-[#0055ff] resize-none text-sm text-gray-800"
                                        disabled={isSubmitting}
                                    />
                                )}
                                <p className="text-[10px] text-gray-400 mt-1">You may manually edit AI-generated text before launching.</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Duration (Days)</label>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff5500] text-sm bg-white text-gray-900"
                                    disabled={isSubmitting}
                                >
                                    <option value={1}>1 Day (Blitz)</option>
                                    <option value={3}>3 Days (Standard)</option>
                                    <option value={7}>7 Days (Deep Dive)</option>
                                </select>
                            </div>

                            <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <div>
                                    <label className="block text-xs font-bold text-gray-800 uppercase">Private Debate</label>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Hidden from Arena. Invite-only access via link.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} disabled={isSubmitting} />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0055ff]"></div>
                                </label>
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
                                    className="px-4 py-2 bg-[#ff5500] hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Launching..." : "Launch Arena"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
