import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

function loadEnv() {
    if (!fs.existsSync(envPath)) {
        console.error('.env file not found');
        process.exit(1);
    }
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
    });
    return env;
}

async function check() {
    console.log('--- Supabase Diagnostic V3 (Admin Auth) ---');
    const env = loadEnv();
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    // 1. Login as Admin
    console.log('Logging in as admin@mystore.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@mystore.com',
        password: 'admin123'
    });

    if (authError) {
        console.error('Login Failed:', authError.message);
        console.log('Skipping authenticated upload test (cannot login).');
    } else {
        console.log('Login Success! Role:', authData.user.role);

        // 2. Upload as Authenticated User
        console.log('\nAttempting upload as AUTHENTICATED user...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(`auth-diag-${Date.now()}.txt`, 'Auth content', { upsert: true });

        if (uploadError) {
            console.error('Authenticated Upload FAILED:', uploadError.message);
        } else {
            console.log('Authenticated Upload SUCCESS!', uploadData.path);
        }
    }
    console.log('--- End ---');
}

check();
