const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    line = line.replace('\r', '').trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].replace(/['"]/g, '').trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function sync() {
    console.log('Fetching users from Clerk...');
    const res = await fetch('https://api.clerk.com/v1/users', {
        headers: { Authorization: 'Bearer ' + env.CLERK_SECRET_KEY }
    });
    const users = await res.json();

    for (const u of users) {
        const email = u.email_addresses[0]?.email_address || '';
        const pseudo = u.username || u.first_name || 'user_' + u.id.substring(0, 8);

        console.log(`Inserting/Updating ${pseudo} (${u.id}) to Supabase...`);
        const { error } = await supabase.from('users').upsert({
            clerk_id: u.id,
            clerk_username: pseudo,
            email: email
        }, { onConflict: 'clerk_id' });

        if (error) {
            console.error(error);
        } else {
            console.log('Success!');
        }
    }
}

sync();
