"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"
import { GoogleGenAI } from '@google/genai'

export async function createCommentAction(
    debateId: string,
    content: string,
    stance: 'for' | 'against',
    parentId?: string
) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to comment.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    // 1. Check if debate is closed
    const { data: debateData, error: debateError } = await supabase
        .from("debates")
        .select("is_closed")
        .eq("id", debateId)
        .single()

    if (debateError || !debateData) return { error: "Debate not found" }
    if (debateData.is_closed) return { error: "This debate is already closed." }

    // 2. Insert Comment Initial
    const payload: any = {
        debate_id: debateId,
        author_id: userId,
        content,
        stance
    }

    if (parentId) {
        payload.parent_id = parentId
    }

    const { error: insertError } = await supabase
        .from("comments")
        .insert(payload)

    if (insertError) {
        return { error: insertError.message }
    }

    // 3. Fire-and-forget Eureka evaluation (Graceful Degradation)
    // In a real app we'd use unawaited promises or queues here.
    // We'll just revalidate so the comment shows up immediately.

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

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        // Ensure the user trying to delete is the original author
        .eq('author_id', userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/debate/${debateId}`)
}
