import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabasePublicEnvOrThrow } from "@/lib/supabase/env";

function buildServerPublicClient(url: string, publishableKey: string): SupabaseClient {
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createServerPublicSupabaseClientOrThrow(): SupabaseClient {
  const env = getSupabasePublicEnvOrThrow();

  return buildServerPublicClient(env.url, env.publishableKey);
}

export async function createServerSupabaseClientOrThrow(): Promise<SupabaseClient> {
  const env = getSupabasePublicEnvOrThrow();

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies.
          // Middleware or Route Handlers should own refresh writes.
        }
      },
    },
  });
}
