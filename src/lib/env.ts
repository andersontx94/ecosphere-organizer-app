type EnvMap = Record<string, string | undefined>;

const env = import.meta.env as EnvMap;

export type SupabaseEnvStatus = {
  url: string;
  anonKey: string;
  isValid: boolean;
  missing: string[];
};

export function getRequiredEnv(key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export function getSupabaseConfig(): SupabaseEnvStatus {
  const url = env.VITE_SUPABASE_URL ?? "";
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const apiKey = publishableKey ?? anonKey ?? "";
  const missing: string[] = [];

  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!apiKey) {
    missing.push("VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY");
  }

  return {
    url,
    anonKey: apiKey,
    isValid: missing.length === 0,
    missing,
  };
}
