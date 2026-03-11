import { SupabaseClient } from '@supabase/supabase-js'

export async function incrementUserReputation(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('reputation_score')
        .eq('clerk_id', userId)
        .single()

    if (!error && data) {
        await supabase
            .from('users')
            .update({
                reputation_score: (data.reputation_score || 0) + 1,
                last_active_at: new Date().toISOString()
            })
            .eq('clerk_id', userId)
    }
}
