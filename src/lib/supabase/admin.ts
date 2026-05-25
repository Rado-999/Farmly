import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv, getSupabaseAdminEnvOrThrow } from "@/lib/supabase/env";

function buildAdminClient(
  url: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createAdminSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseAdminEnv();

  if (!env) {
    return null;
  }

  return buildAdminClient(env.url, env.serviceRoleKey);
}

export function createAdminSupabaseClientOrThrow(): SupabaseClient {
  const env = getSupabaseAdminEnvOrThrow();

  return buildAdminClient(env.url, env.serviceRoleKey);
}
