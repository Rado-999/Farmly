import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserRole } from "@/lib/auth/types";

type CreateProfileInput = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export async function createProfile(
  supabase: SupabaseClient,
  { userId, fullName, email, role }: CreateProfileInput,
) {
  return supabase.from("profiles").upsert(
    {
      id: userId,
      name: fullName.trim(),
      email: email.trim(),
      role,
      is_profile_complete: false,
      onboarding_step: 2,
    },
    { onConflict: "id" },
  );
}
