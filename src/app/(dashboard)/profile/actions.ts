"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"

export async function submitSuggestionAction(content: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to submit a suggestion.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // 1. Find the first available admin
    const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('role', 'admin')
        .limit(1)

    if (adminError || !adminUsers || adminUsers.length === 0) {
        throw new Error("Could not locate a platform admin to receive the suggestion.")
    }

    const adminId = adminUsers[0].clerk_id

    // 2. Insert into the messages inbox instead of suggestions table
    const formattedContent = `💡 SUGGESTION:\n\n${content}`

    const { error: insertError } = await supabase
        .from("messages")
        .insert({
            sender_id: userId,
            receiver_id: adminId,
            content: formattedContent
        })

    if (insertError) {
        throw new Error(insertError.message)
    }
}
