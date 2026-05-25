import type { SupabaseClient } from "@supabase/supabase-js";

import type { FarmerProductAccess } from "@/lib/products/types";

type AccessResult =
  | { ok: true; access: FarmerProductAccess }
  | { ok: false; reason: "anonymous" | "not_farmer" | "incomplete_profile" };

export async function getFarmerProductAccess(
  supabase: SupabaseClient,
): Promise<AccessResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: "anonymous" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_profile_complete, farmer_profiles ( id, slug )")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, reason: "not_farmer" };
  }

  if (!profile.is_profile_complete) {
    return { ok: false, reason: "incomplete_profile" };
  }

  const farmerProfile = Array.isArray(profile.farmer_profiles)
    ? profile.farmer_profiles[0]
    : profile.farmer_profiles;

  if (!farmerProfile?.id || !farmerProfile.slug) {
    return { ok: false, reason: "not_farmer" };
  }

  return {
    ok: true,
    access: {
      userId: user.id,
      farmerProfileId: farmerProfile.id,
      farmerSlug: farmerProfile.slug,
    },
  };
}

export async function assertCanManageProducts(
  supabase: SupabaseClient,
): Promise<AccessResult> {
  return getFarmerProductAccess(supabase);
}
