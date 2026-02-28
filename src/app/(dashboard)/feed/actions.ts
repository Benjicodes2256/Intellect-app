"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export async function createPostAction(content: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to post.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    const { error } = await supabase
        .from("posts")
        .insert({
            author_id: userId,
            content,
            is_eureka_summary: false,
        })

    if (error) {
        console.error("Error creating post:", error)
        throw new Error(error.message)
    }

    revalidatePath("/feed")
}

export async function deletePostAction(postId: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to delete.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', userId) // ensure safety

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/feed")
}

export async function toggleLikePostAction(postId: string, debouncePath: string) {
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
        .eq("post_id", postId)
        .single()

    if (existingLike) {
        // Unlike
        await supabase.from("likes").delete().eq("id", existingLike.id)
    } else {
        // Like
        await supabase.from("likes").insert({
            user_id: userId,
            post_id: postId
        })
    }

    revalidatePath(debouncePath)
}

export async function createPostCommentAction(
    postId: string,
    content: string,
    parentId?: string
) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to comment.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    const payload: any = {
        post_id: postId,
        author_id: userId,
        content,
    }

    if (parentId) {
        payload.parent_id = parentId
    }

    const { error: insertError } = await supabase
        .from("comments")
        .insert(payload)

    if (insertError) {
        throw new Error(insertError.message)
    }

    revalidatePath(`/feed`)
}

export async function deletePostCommentAction(commentId: string) {
    const { userId, getToken } = await auth()

    if (!userId) {
        throw new Error("Must be logged in to delete.")
    }

    const token = await getToken({ template: "supabase" })
    if (!token) throw new Error("Could not fetch auth token")

    const supabase = createSupabaseClient(token)

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/feed`)
}
