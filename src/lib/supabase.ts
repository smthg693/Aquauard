import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const rawPublishable = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

const isPlaceholder = (val: string) =>
  !val ||
  val.includes('your-supabase') ||
  val === 'https://your-supabase-url.supabase.co';

const validUrl = isPlaceholder(rawUrl) ? '' : rawUrl;

// Pick whichever key is provided and is not a placeholder string
const validKey = !isPlaceholder(rawPublishable)
  ? rawPublishable
  : !isPlaceholder(rawAnon)
  ? rawAnon
  : '';

export const isSupabaseConfigured = Boolean(validUrl && validKey);

export const supabase = isSupabaseConfigured
  ? createClient(validUrl, validKey)
  : null;
