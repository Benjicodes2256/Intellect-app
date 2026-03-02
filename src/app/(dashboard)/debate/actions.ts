"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export async function createDebateAction(topic: string, timeframeDays: number) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to create a debate.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // Calculate closure date. Standard timeframe logic.
    const closesAt = new Date()
    closesAt.setDate(closesAt.getDate() + timeframeDays)

    const { error } = await supabase
        .from("debates")
        .insert({
            creator_id: userId,
            topic,
            closes_at: closesAt.toISOString(),
            is_closed: false,
            duration_days: timeframeDays,
        })

    if (error) {
        console.error("Error creating debate:", error)
        throw new Error(error.message)
    }

    revalidatePath("/debate")
}

export async function deleteDebateAction(debateId: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        return { error: "Must be logged in to delete a debate." }
    }

    const token = await getToken({ template: "supabase" })
    if (!token) return { error: "Could not fetch auth token" }

    const supabase = createSupabaseClient(token)

    const { error } = await supabase
        .from("debates")
        .delete()
        .eq("id", debateId)
        .eq("creator_id", userId) // Enforce ownership check

    if (error) {
        console.error("Error deleting debate:", error)
        return { error: error.message }
    }

    revalidatePath("/debate")
    return { success: true }
}
