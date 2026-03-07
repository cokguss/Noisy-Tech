import { createClient } from '@supabase/supabase-js';

// Helper to clean up env variables that might have quotes, spaces, or missing protocol
const cleanUrl = (val?: string) => {
  if (!val) return undefined;
  // Remove quotes, spaces, and invisible characters
  let cleaned = val.replace(/^["']|["']$/g, '').replace(/[\s\u200B-\u200D\uFEFF]/g, '');
  
  // Ensure it has https://
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
};

const cleanKey = (val?: string) => {
  if (!val) return undefined;
  return val.replace(/^["']|["']$/g, '').replace(/[\s\u200B-\u200D\uFEFF]/g, '');
};

const supabaseUrl = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Validate URL before creating client to prevent crashes
    new URL(supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error(`Failed to initialize Supabase. Invalid URL: "${supabaseUrl}". Please check your VITE_SUPABASE_URL.`, error);
  }
}

export const supabase = supabaseInstance;
