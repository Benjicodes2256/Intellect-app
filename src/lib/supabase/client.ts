import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client that utilizes the user's active Clerk session token.
 * This ensures Row Level Security (RLS) is maintained when accessing the database.
 */
export const createSupabaseClient = (clerkToken: string) => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${clerkToken}`,
                },
            },
        }
    )
}
