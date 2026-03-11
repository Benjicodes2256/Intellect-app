"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"
import { GoogleGenAI } from '@google/genai'
import { incrementUserReputation } from "@/lib/reputation-server"

export async function createCommentAction(
    debateId: string,
    content: string,
    stance: 'for' | 'against',
    parentId?: string
) {
    const { userId, getToken } = await auth()

    if (!userId) throw new Error("Authentication required.")

    // §4 — Server-side content length validation
    const trimmed = content?.trim() ?? ''
    if (!trimmed) return { error: "Comment cannot be empty." }
    if (trimmed.length > 2000) return { error: "Comment is too long (max 2000 characters)." }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Authentication required.")

    const supabase = createSupabaseClient(token)

    const { data: debateData, error: debateError } = await supabase
        .from("debates").select("is_closed").eq("id", debateId).single()

    if (debateError || !debateData) return { error: "Debate not found." }
    if (debateData.is_closed) return { error: "This debate is already closed." }

    const payload: any = {
        debate_id: debateId,
        author_id: userId,
        content: trimmed,
        stance
    }

    if (parentId) payload.parent_id = parentId

    const { error: insertError } = await supabase.from("comments").insert(payload)

    if (insertError) {
        console.error("Error inserting comment:", insertError.message)
        return { error: "Failed to post comment. Please try again." }
    }

    await incrementUserReputation(supabase, userId)
    revalidatePath(`/debate/${debateId}`)
    return { success: true }
}

export async function closeDebateEarlyAction(debateId: string) {
    const { userId, getToken } = await auth()
    if (!userId) {
        return { error: "Must be logged in to close a debate." }
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // Verify ownership
    const { data: debate } = await supabase
        .from("debates")
        .select("creator_id")
        .eq("id", debateId)
        .single()

    if (debate?.creator_id !== userId) {
        // Also check if they are an admin as fallback
        const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (userData?.role !== 'admin') {
            return { error: "Only the debate creator can close it early." }
        }
    }

    const { error: updateError } = await supabase
        .from("debates")
        .update({ is_closed: true })
        .eq("id", debateId)

    if (updateError) {
        return { error: updateError.message }
    }

    revalidatePath(`/debate/${debateId}`)
    return { success: true }
}

export async function toggleLikeCommentAction(commentId: string, debouncePath: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to like.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // Check if like exists
    const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", userId)
        .eq("comment_id", commentId)
        .single()

    if (existingLike) {
        // Unlike
        await supabase.from("likes").delete().eq("id", existingLike.id)
    } else {
        // Like
        await supabase.from("likes").insert({
            user_id: userId,
            comment_id: commentId
        })
    }

    revalidatePath(debouncePath)
}

export async function deleteCommentAction(commentId: string, debateId: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to delete.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // Verify debate is not closed
    const { data: debateData } = await supabase
        .from("debates")
        .select("is_closed")
        .eq("id", debateId)
        .single()

    if (debateData?.is_closed) {
        throw new Error("Cannot delete comments from a closed debate.")
    }

    // Check if user is admin
    const { data: userData } = await supabase.from('users').select('role').eq('clerk_id', userId).single()
    const isAdmin = userData?.role === 'admin'

    let query = supabase.from('comments').delete().eq('id', commentId)
    if (!isAdmin) {
        // Ensure the user trying to delete is the original author
        query = query.eq('author_id', userId)
    }

    const { error } = await query

    if (error) {
        console.error("Error deleting comment:", error.message)
        throw new Error("Failed to delete comment. Please try again.")
    }

    revalidatePath(`/debate/${debateId}`)
}
