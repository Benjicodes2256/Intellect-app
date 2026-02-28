"use client"

import { useState } from 'react'
import { Flame } from 'lucide-react'
import { createDebateAction } from '../actions'

export default function CreateDebateButton() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [topic, setTopic] = useState('')
    const [timeframe, setTimeframe] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreateDebate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim()) return

        setIsSubmitting(true)
        try {
            await createDebateAction(topic, timeframe)
            setTopic('')
            setTimeframe(1)
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
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
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
                                    className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff5500] resize-none text-sm"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Duration (Days)</label>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff5500] text-sm bg-white"
                                    disabled={isSubmitting}
                                >
                                    <option value={1}>1 Day (Blitz)</option>
                                    <option value={3}>3 Days (Standard)</option>
                                    <option value={7}>7 Days (Deep Dive)</option>
                                </select>
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
                                    className="px-4 py-2 bg-[#0055ff] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
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
