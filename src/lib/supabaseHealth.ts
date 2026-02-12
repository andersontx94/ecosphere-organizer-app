import { supabase } from "@/lib/supabase";

export async function runSupabaseHealthCheck() {
  try {
    const sessionResult = await supabase.auth.getSession();
    console.info("[supabase] getSession", {
      hasSession: !!sessionResult.data.session,
      error: sessionResult.error?.message ?? null,
    });

    const queryResult = await supabase
      .from("profiles")
      .select("user_id")
      .limit(1);

    console.info("[supabase] public.profiles select", {
      error: queryResult.error?.message ?? null,
      rows: queryResult.data?.length ?? 0,
    });
  } catch (err) {
    console.error("[supabase] health check failed", err);
  }
}
