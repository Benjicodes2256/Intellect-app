import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { BarChart3, Users, MessageSquare, Activity, Flame, Navigation, Link as LinkIcon, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // 1. Verify user is admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', userId)
        .single()

    if (userError || userData?.role !== 'admin') {
        redirect('/feed')
    }

    // 2. Fetch parallel counts
    const [usersCount, postsCount, commentsCount, debatesCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('debates').select('*', { count: 'exact', head: true }).eq('is_closed', false),
    ])

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col mb-8 relative">
                    <Link href="/feed" className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-[#0055ff] transition-colors mb-4 w-fit">
                        <ChevronLeft size={16} />
                        Back to Feed
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <span className="text-[#0055ff]">iNTEL</span><span className="text-[#ff5500]">lect</span> Admin
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Global platform metrics and moderation overview.</p>
                    </div>
                </div>

                {/* Top KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="text-gray-400 mb-2"><Users size={20} /></div>
                        <div className="text-3xl font-black text-gray-900">{usersCount.count || 0}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Total Users</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="text-gray-400 mb-2"><Activity size={20} /></div>
                        <div className="text-3xl font-black text-gray-900">{postsCount.count || 0}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Total Posts</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="text-gray-400 mb-2"><MessageSquare size={20} /></div>
                        <div className="text-3xl font-black text-gray-900">{commentsCount.count || 0}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Total Comments</div>
                    </div>

                </div>

                {/* Secondary Metrics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">

                    {/* Debates & Content */}
                    {/* Debates & Content */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-3">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Flame size={18} className="text-[#ff5500]" />
                            Content & Debate Engagement
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                <div className="text-2xl font-black text-gray-900">{debatesCount.count || 0}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Open Debates</div>
                            </div>
                            <div className="bg-[#ff5500]/10 p-4 rounded-xl border border-[#ff5500]/20 text-center">
                                <div className="text-2xl font-black text-[#ff5500]">System Stable</div>
                                <div className="text-[10px] font-bold text-[#ff5500]/70 uppercase mt-1 flex justify-center items-center gap-1">All Systems Operational</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Global Moderation Action Box */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-red-900 text-lg">Global Moderation Controls</h3>
                        <p className="text-sm text-red-700 mt-1">Actions taken here are irreversible. Ban users or remove debates platform-wide.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white text-red-700 border border-red-200 font-bold py-2 px-4 rounded-xl text-sm transition-colors hover:bg-red-100">
                            Manage Users
                        </button>
                        <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors hover:bg-red-700">
                            Review Flagged Content
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
