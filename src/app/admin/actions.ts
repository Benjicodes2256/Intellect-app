'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Admin actions use the SERVICE ROLE key — bypasses RLS intentionally
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

async function verifyAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error('Authentication required.')

    const supabase = getAdminSupabase()
    const { data } = await supabase
        .from('users').select('role').eq('clerk_id', userId).single()

    if (data?.role !== 'admin') throw new Error('Admin access required.')
    return supabase
}

// ── USER MANAGEMENT ──────────────────────────────────────────
export async function promoteUserAction(targetClerkId: string) {
    const supabase = await verifyAdmin()
    const { error } = await supabase
        .from('users').update({ role: 'admin' }).eq('clerk_id', targetClerkId)
    if (error) {
        console.error('Error promoting user:', error.message)
        throw new Error('Failed to promote user.')
    }
    revalidatePath('/admin')
}

export async function demoteUserAction(targetClerkId: string) {
    const supabase = await verifyAdmin()
    const { error } = await supabase
        .from('users').update({ role: 'user' }).eq('clerk_id', targetClerkId)
    if (error) {
        console.error('Error demoting user:', error.message)
        throw new Error('Failed to demote user.')
    }
    revalidatePath('/admin')
}

export async function deleteUserAction(targetClerkId: string) {
    const supabase = await verifyAdmin()
    // Deleting the user cascades to posts, comments, likes, messages (FK cascade)
    const { error } = await supabase
        .from('users').delete().eq('clerk_id', targetClerkId)
    if (error) {
        console.error('Error deleting user:', error.message)
        throw new Error('Failed to remove user.')
    }
    revalidatePath('/admin')
}

// ── FLAGGED CONTENT ───────────────────────────────────────────
export async function deleteFlaggedCommentAction(commentId: string) {
    const supabase = await verifyAdmin()
    const { error } = await supabase
        .from('comments').delete().eq('id', commentId)
    if (error) {
        console.error('Error deleting comment:', error.message)
        throw new Error('Failed to delete comment.')
    }
    revalidatePath('/admin')
}

export async function flagCommentAction(commentId: string, field: 'is_fluff' | 'is_vulgar', value: boolean) {
    const supabase = await verifyAdmin()
    const { error } = await supabase
        .from('comments').update({ [field]: value }).eq('id', commentId)
    if (error) {
        console.error('Error flagging comment:', error.message)
        throw new Error('Failed to update flag.')
    }
    revalidatePath('/admin')
}

export async function deletePostAdminAction(postId: string) {
    const supabase = await verifyAdmin()
    const { error } = await supabase
        .from('posts').delete().eq('id', postId)
    if (error) {
        console.error('Error deleting post:', error.message)
        throw new Error('Failed to delete post.')
    }
    revalidatePath('/admin')
}

export async function reopenDebateAdminAction(debateId: string) {
    const supabase = await verifyAdmin()

    // 1. Reopen the debate
    const { error: updateError } = await supabase
        .from('debates').update({ is_closed: false }).eq('id', debateId)

    if (updateError) {
        console.error('Error reopening debate:', updateError.message)
        return { error: 'Failed to reopen debate.' }
    }

    // 2. Clear out the previous Eureka summary comment
    await supabase.from('comments')
        .delete()
        .eq('debate_id', debateId)
        .eq('stance', 'neutral')

    revalidatePath(`/debate/${debateId}`)
    return { success: true }
}
