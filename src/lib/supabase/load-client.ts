import type { SupabaseClient } from "@supabase/supabase-js";

export async function loadSupabaseClient(): Promise<SupabaseClient | null> {
  const { createSupabaseClient } = await import("@/lib/supabase");
  return createSupabaseClient();
}
