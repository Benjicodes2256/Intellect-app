"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"
import { incrementUserReputation } from "@/lib/reputation-server"

export async function createDebateAction(topic: string, timeframeDays: number, introduction?: string, isPrivate: boolean = false) {
    const { userId, getToken } = await auth()

    if (!userId) throw new Error("Authentication required.")

    // §4 — Server-side content length validation
    const trimmedTopic = topic?.trim() ?? ''
    if (!trimmedTopic) throw new Error("Debate topic cannot be empty.")
    if (trimmedTopic.length > 300) throw new Error("Topic is too long (max 300 characters).")

    const trimmedIntro = introduction?.trim() ?? ''
    if (trimmedIntro.length > 2000) throw new Error("Introduction is too long (max 2000 characters).")

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Authentication required.")

    const supabase = createSupabaseClient(token)

    const closesAt = new Date()
    closesAt.setDate(closesAt.getDate() + timeframeDays)

    const insertData: any = {
        creator_id: userId,
        topic: trimmedTopic,
        closes_at: closesAt.toISOString(),
        is_closed: false,
        duration_days: timeframeDays,
        is_private: isPrivate,
    }

    if (trimmedIntro !== '') {
        insertData.introduction = trimmedIntro
    }

    const { error } = await supabase.from("debates").insert(insertData)

    if (error) {
        console.error("Error creating debate:", error.message)
        throw new Error("Failed to create debate. Please try again.")
    }

    await incrementUserReputation(supabase, userId)
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

    // Check if user is admin
    const { data: userData } = await supabase.from('users').select('role').eq('clerk_id', userId).single()
    const isAdmin = userData?.role === 'admin'

    let query = supabase.from("debates").delete().eq("id", debateId)
    if (!isAdmin) {
        query = query.eq("creator_id", userId) // Enforce ownership check for regular users
    }

    const { error } = await query

    if (error) {
        console.error("Error deleting debate:", error.message)
        return { error: "Failed to delete debate. Please try again." }
    }

    revalidatePath("/debate")
    return { success: true }
}
