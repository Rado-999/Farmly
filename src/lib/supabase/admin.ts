import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnvOrThrow } from "@/lib/supabase/env";

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

export function createAdminSupabaseClientOrThrow(): SupabaseClient {
  const env = getSupabaseAdminEnvOrThrow();

  return buildAdminClient(env.url, env.serviceRoleKey);
}
