import { Flame, Users, Clock, Trash2, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from '@/lib/supabase/client'
import CreateDebateButton from './components/CreateDebateModal'
import DeleteDebateButton from './components/DeleteDebateButton'

function DebateBar({ scoreFor, scoreAgainst }: { scoreFor: number, scoreAgainst: number }) {
    const total = scoreFor + scoreAgainst;
    const percentageFor = total === 0 ? 50 : (scoreFor / total) * 100;

    return (
        <div className="w-full mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                <span className="text-[#0055ff]">For ({scoreFor})</span>
                <span>Eureka Evaluation</span>
                <span className="text-[#ff5500]">Against ({scoreAgainst})</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex">
                <div
                    className="h-full bg-[#0055ff] transition-all duration-1000"
                    style={{ width: `${percentageFor}%` }}
                ></div>
                <div
                    className="h-full bg-[#ff5500] transition-all duration-1000"
                    style={{ width: `${100 - percentageFor}%` }}
                ></div>
            </div>
        </div>
    )
}

function DebateTile({ debate, isOwner }: { debate: any, isOwner: boolean }) {
    // Calculate days left
    const closesAt = new Date(debate.closes_at)
    const now = new Date()
    const diffTime = closesAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isClosed = debate.is_closed || diffDays <= 0

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 hover:border-blue-100 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-50 text-[#ff5500] px-2 py-1 rounded font-bold text-xs flex items-center gap-1 border border-orange-100">
                        <Flame size={14} />
                        {debate.rating || 0} Rating
                    </div>
                    <div className={clsx(
                        "px-2 py-1 rounded font-bold text-xs flex items-center gap-1 border",
                        isClosed ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-blue-50 text-[#0055ff] border-blue-100"
                    )}>
                        <Clock size={14} />
                        {isClosed ? 'Closed' : `${diffDays}d Left`}
                    </div>
                </div>
                {isOwner && (
                    <DeleteDebateButton debateId={debate.id} />
                )}
            </div>

            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-[#0055ff] transition-colors">
                {debate.topic}
            </h2>

            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-2">
                <Users size={14} /> 0 Participants • Created by {debate.users?.clerk_username || 'Unknown User'}
            </div>

            <DebateBar scoreFor={debate.eureka_score_for || 0} scoreAgainst={debate.eureka_score_against || 0} />

            <div className="mt-4 flex justify-end">
                <Link
                    href={`/debate/${debate.id}`}
                    className="flex items-center gap-2 text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-4 py-2 rounded-xl transition-all"
                >
                    View Debate <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    )
}

export default async function DebatePage() {
    const { userId, getToken } = await auth()

    if (!userId) {
        return <div>Please sign in to view debates.</div>
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // Fetch real debates from Supabase with creator's username
    const { data: debates, error } = await supabase
        .from('debates')
        .select('*, users!debates_creator_id_fkey(clerk_username)')
        .order('created_at', { ascending: false })

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[#0055ff]">Master Debates</h1>
                    <p className="text-sm text-gray-500 mt-1">Join the arena. Argue with logic, not emotion.</p>
                </div>

                <CreateDebateButton />
            </div>

            <div className="space-y-4">
                {error && <p className="text-red-500 text-sm">Error loading debates: {error.message}</p>}

                {debates?.length === 0 && !error && (
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-sm text-gray-500">
                        No active debates found. Be the first to start one!
                    </div>
                )}

                {debates?.map(debate => (
                    <DebateTile
                        key={debate.id}
                        debate={debate}
                        isOwner={debate.creator_id === userId}
                    />
                ))}

                <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 mt-8 font-medium">
                    More debates loading... Make sure you have the facts straight.
                </div>
            </div>
        </div>
    )
}
