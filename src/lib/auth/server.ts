import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { ONBOARDING_PATH, PROFILE_PATH } from "@/lib/auth/constants";
import { ensureProfileForAuthUser } from "@/lib/auth/ensure-profile";
import { fetchOnboardingProfile } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { getFarmerProductAccess } from "@/lib/products/access";
import type { FarmerProductAccess } from "@/lib/products/types";
import { createServerSupabaseClientOrThrow } from "@/lib/supabase/server";

type ServerAuthContext = {
  supabase: SupabaseClient;
  user: User;
};

type ServerProfileContext = ServerAuthContext & {
  profile: OnboardingProfile;
};

type ServerFarmerProductAccessResult =
  | {
      kind: "ready";
      supabase: SupabaseClient;
      access: FarmerProductAccess;
    }
  | {
      kind: "blocked";
      reason: "not_farmer" | "incomplete_profile";
      href: string;
      label: string;
    };

function redirectToLogin(nextPath: string): never {
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

export async function requireServerUser(
  nextPath: string,
): Promise<ServerAuthContext> {
  const supabase = await createServerSupabaseClientOrThrow();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirectToLogin(nextPath);
  }

  return { supabase, user };
}

export async function requireServerProfile(
  nextPath: string,
): Promise<ServerProfileContext> {
  const { supabase, user } = await requireServerUser(nextPath);

  await ensureProfileForAuthUser(supabase, user);

  const profile = await fetchOnboardingProfile(supabase, user.id);

  if (!profile) {
    throw new Error("Failed to load the authenticated Farmly profile.");
  }

  return { supabase, user, profile };
}

export async function requireServerFarmerProductAccess(
  nextPath: string,
): Promise<ServerFarmerProductAccessResult> {
  const { supabase, user } = await requireServerUser(nextPath);

  await ensureProfileForAuthUser(supabase, user);

  const result = await getFarmerProductAccess(supabase);

  if (result.ok) {
    return {
      kind: "ready",
      supabase,
      access: result.access,
    };
  }

  if (result.reason === "anonymous") {
    redirectToLogin(nextPath);
  }

  if (result.reason === "incomplete_profile") {
    return {
      kind: "blocked",
      reason: "incomplete_profile",
      href: ONBOARDING_PATH,
      label: "Към настройката",
    };
  }

  return {
    kind: "blocked",
    reason: "not_farmer",
    href: PROFILE_PATH,
    label: "Към профила",
  };
}
