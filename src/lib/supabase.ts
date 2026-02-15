import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabaseConfig } from "@/lib/env";

const supabaseConfig = getSupabaseConfig();

if (!supabaseConfig.isValid) {
  console.error(
    "[supabase] Missing environment variables:",
    supabaseConfig.missing.join(", ")
  );
}

const fallbackUrl = "https://invalid.supabase.co";
const fallbackKey = "invalid";

export const supabase = createClient<Database>(
  supabaseConfig.url || fallbackUrl,
  supabaseConfig.anonKey || fallbackKey,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isSupabaseConfigured = supabaseConfig.isValid;
export const supabaseConfigError = supabaseConfig.isValid
  ? null
  : `Ambiente Supabase incompleto: ${supabaseConfig.missing.join(", ")}.`;
