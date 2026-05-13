import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only allow valid URLs
  if (!url || !key || !url.startsWith('http')) {
    throw new Error('Supabase environment variables not configured');
  }

  return createBrowserClient(url, key);
}