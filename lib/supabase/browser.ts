"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv } from "@/lib/env";

let browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!hasPublicSupabaseEnv || !env.nextPublicSupabaseUrl || !env.nextPublicSupabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(env.nextPublicSupabaseUrl, env.nextPublicSupabaseAnonKey);
  }

  return browserClient;
}
