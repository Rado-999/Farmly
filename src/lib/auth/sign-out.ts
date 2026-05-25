import { createSupabaseClient } from "@/lib/supabase";

export async function signOutUser(): Promise<boolean> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.auth.signOut();
  return !error;
}
