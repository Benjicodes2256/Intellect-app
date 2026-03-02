import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Info, Maximize2, Minimize2 } from 'lucide-react'
import InboxMessageCard from './components/InboxMessageCard'

function CharterBanner() {
    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 transition-all">
            <div className="flex justify-between items-center cursor-pointer">
                <h3 className="font-bold text-sm flex items-center gap-2 text-gray-900">
                    <Info className="text-[#0055ff]" size={16} />
                    🏛️ The iNTELlect Community Charter
                </h3>
            </div>

            <ul className="text-xs text-gray-800 space-y-3 mt-4 border-t border-gray-200 pt-4">
                <li><strong>Attack the Idea, Not the Person:</strong> All debates must focus on the logic. Personal attacks result in removal.</li>
                <li><strong>The "Logic Point" Rule:</strong> Every comment should add value. Avoid "fluff".</li>
                <li><strong>No Vulgarity or Profanity:</strong> iNTELlect is a professional utility.</li>
                <li><strong>Zero Tolerance for Threats:</strong> Threats result in a permanent account ban.</li>
                <li><strong>Hate Speech:</strong> Strict bans filter hate or discrimination.</li>
                <li><strong>Fact-Check Bounties:</strong> Verify a claim = Reputation Points.</li>
            </ul>
        </div>
    )
}

export default async function InboxPage() {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // Fetch messages where the user is either the sender OR receiver
    // Include relationship joining so we can show usernames. We need aliases because there's two relations.
    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender_users:users!messages_sender_id_fkey(clerk_username, role),
            receiver_users:users!messages_receiver_id_fkey(clerk_username, role)
        `)
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0055ff]">Inbox</h1>
                <p className="text-sm text-gray-500 mt-1">Direct messages self-destruct after 5 days automatically.</p>
            </div>

            <CharterBanner />

            <div className="space-y-1">
                {messages?.length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
                        Your inbox is completely empty. Start a conversation on the Feed or in a Debate!
                    </div>
                )}

                {messages?.map(msg => (
                    <InboxMessageCard key={msg.id} msg={msg} currentUserId={userId} />
                ))}

                {messages && messages.length > 0 && (
                    <div className="text-center text-xs text-gray-400 py-6 font-medium border-t border-gray-100 mt-8">
                        No more messages. Time to dive back into a debate!
                    </div>
                )}
            </div>
        </div>
    )
}
