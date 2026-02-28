import { BottomNav } from '@/components/layout/BottomNav'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import OnboardingTour from '@/components/layout/OnboardingTour'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: userData } = await supabase
        .from('users')
        .select('role, has_completed_onboarding')
        .eq('clerk_id', userId)
        .single()

    const isAdmin = userData?.role === 'admin'
    // Default to true if somehow null to prevent annoying tours on error
    const completedOnboarding = userData?.has_completed_onboarding ?? true

    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative">
            {/* Top Header Placeholder */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex justify-between items-center max-w-2xl mx-auto">
                    <div className="text-[#0055ff] text-xl font-bold tracking-tight">
                        iNTEL<span className="text-[#ff5500]">lect</span>
                    </div>
                    {/* Reputation / Rank logic goes here eventually */}
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-[10px] font-bold bg-[#ff5500]/10 text-[#ff5500] px-2 py-1 rounded border border-[#ff5500]/20 hover:bg-[#ff5500]/20 transition-colors uppercase tracking-wider"
                            >
                                Admin Dashboard
                            </Link>
                        )}
                        <div className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">Apprentice</div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-2xl mx-auto p-4 w-full">
                {children}
            </main>

            <OnboardingTour userId={userId} completedOnboarding={completedOnboarding} />

            {/* Mobile-first bottom navigation */}
            <BottomNav />
        </div>
    )
}
