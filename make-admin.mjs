import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tiqcmkbrmctvdnbpwafu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcWNta2JybWN0dmRuYnB3YWZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExNjUxMCwiZXhwIjoyMDg3NjkyNTEwfQ.i4dq6H-ETzjphXw0DtGjTSaJFq0FVWK21RW1q0uU0VM'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeAdmin() {
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        // Just updating all rows since this is a local/dev platform mostly, or we could just match 'adminme'
        .neq('role', 'admin')

    if (error) {
        console.error("Error updating users:", error)
    } else {
        console.log("Successfully updated all users to admin role.")
    }
}

makeAdmin()
