import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";

export function getAnonServerClient(): SupabaseClient | null {
  if (!hasPublicSupabaseEnv || !env.nextPublicSupabaseUrl || !env.nextPublicSupabaseAnonKey) {
    return null;
  }

  return createClient(env.nextPublicSupabaseUrl, env.nextPublicSupabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getServiceRoleClient(): SupabaseClient | null {
  if (
    !hasServiceRoleEnv ||
    !env.nextPublicSupabaseUrl ||
    !env.supabaseServiceRoleKey
  ) {
    return null;
  }

  return createClient(env.nextPublicSupabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
