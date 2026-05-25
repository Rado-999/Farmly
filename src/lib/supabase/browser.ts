import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null | undefined;

export function createBrowserSupabaseClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  if (browserClient === undefined) {
    browserClient = createBrowserClient(env.url, env.publishableKey);
  }

  return browserClient;
}
