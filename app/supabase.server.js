import { createClient } from "@supabase/supabase-js";

// Create fresh client on each call — avoids Vercel serverless cold-start env var issues
export const getSupabase = () => createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Keep backward compat for files that import { supabase }
export const supabase = {
  from: (...args) => getSupabase().from(...args),
  rpc: (...args) => getSupabase().rpc(...args),
};