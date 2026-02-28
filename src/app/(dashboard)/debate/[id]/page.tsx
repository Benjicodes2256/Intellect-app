import { Flame, Clock, Users, ArrowLeft, Send } from 'lucide-react'
import { clsx } from 'clsx'
import Link from 'next/link'
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import CreateCommentForm from './components/CreateCommentForm'
import DebateCommentActions from './components/DebateCommentActions'

export default async function DebateThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { userId, getToken } = await auth()

    if (!userId) {
        return <div>Please sign in to view this debate.</div>
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // 1. Fetch Debate Topic
    const { data: debate, error: debateError } = await supabase
        .from('debates')
        .select('*')
        .eq('id', id)
        .single()

    if (debateError || !debate) {
        notFound()
    }

    // 2. Fetch Comments
    const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*, users(*), likes(user_id)')
        .eq('debate_id', id)
        .order('created_at', { ascending: true })

    // Calculate days left
    const closesAt = new Date(debate.closes_at)
    const now = new Date()
    const diffTime = closesAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isClosed = debate.is_closed || diffDays <= 0

    return (
        <div className="animate-in fade-in duration-500 min-h-[calc(100vh-80px)] flex flex-col pb-32 pt-2">

            <div className="shrink-0 mb-4">
                {/* Header / Thread Nav */}
                <div className="mb-6 flex space-x-4 items-center px-1">
                    <Link href="/debate" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <ArrowLeft size={20} className="text-gray-700" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#0055ff]">Debate Arena</h1>
                    </div>
                </div>

                {/* Main Topic Banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
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
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 leading-snug mb-3">
                        {debate.topic}
                    </h2>

                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium pb-4 border-b border-gray-100">
                        <Users size={14} /> {comments?.length || 0} Participants
                    </div>

                    <div className="mt-4 flex gap-4">
                        <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                            <div className="text-sm font-bold text-[#0055ff] uppercase">FOR ({debate.eureka_score_for || 0}%)</div>
                        </div>
                        <div className="flex-1 bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-center">
                            <div className="text-sm font-bold text-[#ff5500] uppercase">AGAINST ({debate.eureka_score_against || 0}%)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thread (Scrollable Chat Feed) */}
            <div className="flex-1 space-y-3 mb-2 px-2 flex flex-col">
                <h3 className="font-bold text-gray-900 px-2 tracking-wide uppercase text-sm mb-2 text-center opacity-50">Live Arguments</h3>

                {/* Eureka System Welcome Message */}
                <div className="flex flex-col w-full mb-3 items-center">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-2xl p-4 shadow-sm max-w-[95%] md:max-w-[85%] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0055ff] to-purple-500 opacity-50"></div>
                        <div className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0055ff] to-purple-600 mb-2 flex items-center justify-center gap-1.5 text-[10px] tracking-widest uppercase">
                            Eureka System
                        </div>
                        <div className="text-[13px] text-gray-700 leading-relaxed font-medium">
                            Welcome to the Arena. The topic is <span className="font-bold text-gray-900 leading-relaxed px-1">"{debate.topic}"</span>.
                            <br /><br />
                            Remember the Charter: logical integrity is required. Unsubstantiated claims will be penalized, and factual logic will be rewarded. Make the first move to earn Reputation Points!
                        </div>
                    </div>
                </div>

                {comments?.map((comment: any) => {
                    const isMe = userId === comment.author_id;
                    return (
                        <div key={comment.id} className={clsx(
                            "flex flex-col w-full mb-1",
                            isMe ? "items-start" : "items-end"
                        )}>

                            {/* Parent Reply Context if exists */}
                            {comment.parent_id && (
                                <div className={clsx(
                                    "flex flex-col mx-2 mb-1 px-3 py-1.5 rounded-xl border-l-4 text-xs opacity-80 max-w-[75%]",
                                    isMe ? "bg-[#ff5500]/10 border-[#ff5500]" : "bg-black/5 border-gray-400"
                                )}>
                                    <div className={clsx("font-bold mb-0.5", isMe ? "text-[#ff5500]" : "text-gray-700")}>
                                        {comments.find((c: any) => c.id === comment.parent_id)?.users?.clerk_username || 'Participant'}
                                    </div>
                                    <div className="text-gray-600 truncate">
                                        {comments.find((c: any) => c.id === comment.parent_id)?.content || 'Original message removed'}
                                    </div>
                                </div>
                            )}

                            {/* Chat Bubble Container */}
                            <div className={clsx(
                                "relative transition-all max-w-[95%] md:max-w-[85%] rounded-2xl p-3 shadow-sm",
                                isMe
                                    ? "bg-[#ff5500]/10 border border-[#ff5500]/20 text-gray-900 rounded-tr-sm"
                                    : "bg-[#0055ff]/10 border border-[#0055ff]/20 text-gray-900 rounded-tl-sm"
                            )}>
                                {/* Info Row */}
                                <div className="flex justify-between items-start mb-1.5 gap-4">
                                    <div className="font-bold text-[11px] flex items-center gap-1.5">
                                        {comment.users?.clerk_username || 'Unknown User'}
                                        <span className={clsx(
                                            "text-[9px] px-1 py-0.5 rounded-sm font-bold uppercase",
                                            comment.stance === 'for' ? "bg-blue-100 text-[#0055ff]" : "bg-orange-100 text-[#ff5500]"
                                        )}>
                                            {comment.stance}
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-medium whitespace-nowrap mt-0.5 opacity-70">
                                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="text-[13px] leading-snug mb-2 whitespace-pre-wrap break-words">
                                    {comment.content}
                                </div>

                                {/* Actions & Interactions */}
                                <DebateCommentActions
                                    comment={comment}
                                    debateId={debate.id}
                                    userId={userId}
                                    isClosed={isClosed}
                                />

                                {comment.eureka_points_awarded > 0 && (
                                    <div className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded w-full">
                                        +{comment.eureka_points_awarded} Rep Points (Verified)
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Anchored Input Form */}
            <div className="fixed bottom-[65px] left-0 right-0 z-40 px-2 pb-2 pointer-events-none transition-transform pointer-events-none">
                <div className="max-w-2xl mx-auto w-full pointer-events-auto">
                    {!isClosed ? (
                        <CreateCommentForm debateId={debate.id} />
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="font-bold text-gray-600">This debate is sealed.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
