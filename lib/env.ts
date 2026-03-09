export const env = {
  nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const hasPublicSupabaseEnv =
  Boolean(env.nextPublicSupabaseUrl) && Boolean(env.nextPublicSupabaseAnonKey);

export const hasServiceRoleEnv =
  hasPublicSupabaseEnv && Boolean(env.supabaseServiceRoleKey);
