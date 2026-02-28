import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Info, Flame, MessageSquare, Inbox } from 'lucide-react'

export default async function OnboardingPage() {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }

    // NOTE: We will check the DB if the user has already agreed to the charter eventually.
    // For now, this acts as a mandatory visual gate they must accept.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 pb-24">
            <div className="max-w-md w-full mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                <div className="text-center mb-8">
                    <div className="text-[#0055ff] text-3xl font-bold tracking-tight mb-2">
                        Welcome to iNTEL<span className="text-[#ff5500]">lect</span>
                    </div>
                    <p className="text-gray-500 text-sm">The platform for great minds to discuss, debate, and appreciate.</p>
                </div>

                <div className="space-y-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Info className="text-[#0055ff]" size={20} />
                        Quick Guide
                    </h2>

                    <div className="flex items-start gap-4">
                        <div className="bg-[#ff5500]/10 p-2 rounded-lg text-[#ff5500] shrink-0">
                            <Flame size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">1. Join Master Debates</h3>
                            <p className="text-xs text-gray-500 mt-1">Pick a side, argue with logic, and earn reputation points. Evaluated by Eureka AI.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-[#ff5500]/10 p-2 rounded-lg text-[#ff5500] shrink-0">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">2. Browse the Feed</h3>
                            <p className="text-xs text-gray-500 mt-1">Read debate summaries, share ideas, and engage with the intellectual community.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-[#ff5500]/10 p-2 rounded-lg text-[#ff5500] shrink-0">
                            <Inbox size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">3. Direct Messaging</h3>
                            <p className="text-xs text-gray-500 mt-1">Slide into the DMs of other thinkers. Messages self-destruct after 5 days.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 max-h-[250px] overflow-y-auto">
                    <h3 className="font-bold text-sm mb-3">🏛️ The iNTELlect Community Charter</h3>
                    <ul className="text-xs text-gray-600 space-y-3">
                        <li><strong>Attack the Idea, Not the Person:</strong> All debates must focus on the logic, data, or framework presented. Personal attacks result in immediate comment removal.</li>
                        <li><strong>The "Logic Point" Rule:</strong> Every comment should add value. Avoid "fluff" like "I agree" or "Great post".</li>
                        <li><strong>No Vulgarity or Profanity:</strong> iNTELlect is a professional utility. Vulgar language is prohibited.</li>
                        <li><strong>Zero Tolerance for Threats:</strong> Threats or doxxing result in a permanent ban.</li>
                        <li><strong>Hate Speech:</strong> Discrimination is strictly forbidden and filtered by the AI Moderator.</li>
                        <li><strong>Fact-Check Bounties:</strong> Verify claims with peer-reviewed sources to earn Reputation Points.</li>
                        <li><strong>Truth Score Accountability:</strong> Unverified information drops your Truth Score, limiting your ability to start debates.</li>
                    </ul>
                </div>

                <form action={async () => {
                    "use server"
                    // In a real flow, we would update the `users` table `agreed_to_charter` via Server Action here
                    // For now, redirect to dashboard
                    const { redirect: serverRedirect } = await import('next/navigation')
                    serverRedirect('/debate')
                }}>
                    <button className="w-full bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold py-3 px-4 rounded-xl transition-colors">
                        I Accept the Charter
                    </button>
                </form>

            </div>
        </div>
    )
}
