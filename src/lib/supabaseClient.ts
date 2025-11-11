import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const importMetaEnv = typeof import.meta !== 'undefined' && (import.meta as any)?.env
  ? (import.meta as any).env
  : undefined;

const getEnv = (key: string) => {
  if (importMetaEnv && key in importMetaEnv) {
    return importMetaEnv[key];
  }
  return process.env[key];
};

const supabaseUrl =
  getEnv('VITE_SUPABASE_URL') ??
  getEnv('SUPABASE_URL');

const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey =
  getEnv('VITE_SUPABASE_ANON_KEY') ??
  getEnv('SUPABASE_ANON_KEY');

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const isServer = typeof window === 'undefined';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: !isServer,
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper to get session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Helper to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

