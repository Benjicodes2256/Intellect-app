"use client"

import { useState } from 'react'
import { User, MapPin, Briefcase, Award, ShieldAlert, Send } from 'lucide-react'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { submitSuggestionAction } from './actions'

const REPUTATION_TIERS = ['Apprentice', 'Rookie', 'Pro', 'Scholar', 'Einstein']

export default function ProfilePage() {
    const { isLoaded, user } = useUser()
    const [suggestion, setSuggestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isLoaded || !user) {
        return <div className="p-6 text-center text-gray-500 animate-pulse">Loading profile...</div>
    }

    // MOCK data that would normally come from the `public.users` Supabase table
    const mockDbUser = {
        reputationScore: 45,
        truthScore: 98,
        // Just calculating string tier for mockup
        tier: REPUTATION_TIERS[1],
        nextTierTarget: 100, // Score needed for next tier
    }

    const handleSuggestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!suggestion.trim()) return

        setIsSubmitting(true)
        try {
            await submitSuggestionAction(suggestion)
            alert('Your suggestion has been securely sent to the Admin Inbox! They will review it shortly.')
            setSuggestion('')
        } catch (error: any) {
            alert(error.message || 'Failed to submit suggestion.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const progressPercentage = (mockDbUser.reputationScore / mockDbUser.nextTierTarget) * 100

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#0055ff]">Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your identity and track your logic.</p>
                </div>
                <SignOutButton>
                    <button className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        Sign Out
                    </button>
                </SignOutButton>
            </div>

            {/* User Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={user.imageUrl}
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-full border-2 border-[#0055ff]"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user.fullName || "Intellectual User"}</h2>
                        <p className="text-sm text-gray-500 font-mono">@{user.username || user.firstName?.toLowerCase() || 'user'}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} className="text-[#ff5500]" />
                        <span>{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-[#ff5500]" />
                        <span>Earth (Location pending)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase size={16} className="text-[#ff5500]" />
                        <span>Professional Thinker</span>
                    </div>
                </div>

                {/* Reputation Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#0055ff] uppercase tracking-wide">Reputation Tier</span>
                            <Award size={16} className="text-[#0055ff]" />
                        </div>
                        <div className="text-2xl font-black text-gray-900">{mockDbUser.tier}</div>

                        <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-500 font-bold tracking-wide mb-1">
                                <span>{mockDbUser.reputationScore} PTS</span>
                                <span>{mockDbUser.nextTierTarget} TO NEXT</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#0055ff] h-1.5 rounded-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 italic">“One more verified fact-check and you’ll reach {REPUTATION_TIERS[2]} status.”</p>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#ff5500] uppercase tracking-wide">Truth Score</span>
                            <ShieldAlert size={16} className="text-[#ff5500]" />
                        </div>
                        <div className="text-2xl font-black text-gray-900">{mockDbUser.truthScore}%</div>
                        <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                            Consistently posting debunked/unverified claims lowers this. Drops below 80% restrict your ability to start Master Debates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Suggestion Box */}
            <form onSubmit={handleSuggestionSubmit} className="tour-suggestion-box bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Send size={18} className="text-gray-400" />
                    Send a Suggestion
                </h3>
                <p className="text-xs text-gray-500 mb-4">Have an idea to improve the platform? Send it directly to Admin.</p>

                <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="I think we should add..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0055ff] min-h-[100px] mb-3 resize-y disabled:opacity-50"
                    required
                />

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#0055ff] hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending...' : 'Submit Suggestion'}
                    </button>
                </div>
            </form>
        </div>
    )
}
