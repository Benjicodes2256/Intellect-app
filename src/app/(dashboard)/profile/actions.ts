"use server"

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "@/lib/supabase/client"
import { calculateReputationTier, checkAndApplyDemotion } from "@/lib/reputation"

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

export async function fetchUserProfileMetricsAction() {
    const { userId, getToken } = await auth()
    if (!userId) throw new Error("Authentication required")

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    const { data: userData, error } = await supabase
        .from('users')
        .select('reputation_score, truth_score, tier_demotions, last_active_at')
        .eq('clerk_id', userId)
        .single()

    if (error || !userData) {
        throw new Error("Failed to fetch user metrics: " + (error?.message || "User not found"))
    }

    const { applyDemotion, newDemotionsTotal } = checkAndApplyDemotion(userData.last_active_at, userData.tier_demotions || 0)

    if (applyDemotion && newDemotionsTotal !== undefined) {
        // Apply penalty and reset the inactivity timer
        await supabase
            .from('users')
            .update({
                tier_demotions: newDemotionsTotal,
                last_active_at: new Date().toISOString()
            })
            .eq('clerk_id', userId)

        userData.tier_demotions = newDemotionsTotal
    }

    const calculatedTier = calculateReputationTier(userData.reputation_score || 0, userData.tier_demotions || 0)

    return {
        reputationScore: userData.reputation_score || 0,
        truthScore: userData.truth_score || 100,
        calculatedTier
    }
}
