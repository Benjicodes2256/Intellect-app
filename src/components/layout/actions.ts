'use server'

import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export async function completeOnboardingAction() {
    const { userId, getToken } = await auth()
    if (!userId) return

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    await supabase
        .from('users')
        .update({ has_completed_onboarding: true })
        .eq('clerk_id', userId)
}
