import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

// Create supabase client or mock client based on environment variables
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found. Running in offline mode.');
    // Create a mock client for offline mode
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'OFFLINE_MODE' } })
          })
        }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Offline mode' } })
      })
    } as any;
  } else {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    });
  }
};

export const supabase = createSupabaseClient();