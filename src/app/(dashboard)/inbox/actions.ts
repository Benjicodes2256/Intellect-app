"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export async function deleteMessageAction(messageId: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to delete.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // Delete message where id matches and current user is sender OR receiver
    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inbox')
}

export async function sendMessageAction(receiverId: string, content: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to send a message.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    const { error: insertError } = await supabase
        .from("messages")
        .insert({
            sender_id: userId,
            receiver_id: receiverId,
            content
        })

    if (insertError) {
        throw new Error(insertError.message)
    }

    revalidatePath('/inbox')
}
