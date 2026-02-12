type EnvMap = Record<string, string | undefined>;

const env = import.meta.env as EnvMap;

export function getRequiredEnv(key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export function getSupabaseConfig() {
  const url = getRequiredEnv("VITE_SUPABASE_URL");
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const apiKey = publishableKey ?? anonKey;

  if (!apiKey) {
    throw new Error(
      "Missing required env var: VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)"
    );
  }

  return { url, anonKey: apiKey };
}
