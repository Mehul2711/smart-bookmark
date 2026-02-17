// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Create the Supabase client and force it to use sessionStorage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Next.js runs on the server and the client, so we must check if 'window' exists first
    ...(typeof window !== "undefined"
      ? { storage: window.sessionStorage }
      : {}),
  },
});
