import {
  DISCOVER_PATH,
  ONBOARDING_PATH,
  VILLAGE_PATH,
} from "@/lib/auth/constants";
import { userHasFollows } from "@/lib/marketplace/follows";
import { fetchOnboardingProfile, needsOnboarding } from "@/lib/onboarding/state";
import type { SupabaseClient } from "@supabase/supabase-js";

export function resolveSafeNextPath(nextParam: string | null): string | null {
  if (nextParam?.startsWith("/") && !nextParam.startsWith("//")) {
    return nextParam;
  }

  return null;
}

export async function resolvePostAuthPath(
  supabase: SupabaseClient,
  userId: string,
  nextParam: string | null,
): Promise<string> {
  const safeNext = resolveSafeNextPath(nextParam);

  if (safeNext && safeNext !== ONBOARDING_PATH) {
    return safeNext;
  }

  const profile = await fetchOnboardingProfile(supabase, userId);

  if (profile && needsOnboarding(profile)) {
    return ONBOARDING_PATH;
  }

  if (safeNext) {
    return safeNext;
  }

  const hasFollows = await userHasFollows(supabase, userId);
  if (hasFollows) {
    return VILLAGE_PATH;
  }

  return DISCOVER_PATH;
}
