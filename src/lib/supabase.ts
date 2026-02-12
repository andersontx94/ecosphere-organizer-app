import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabaseConfig } from "@/lib/env";

const { url, anonKey } = getSupabaseConfig();

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
