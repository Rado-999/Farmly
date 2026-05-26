import {
  DISCOVER_PATH,
  ONBOARDING_PATH,
  VILLAGE_PATH,
} from "@/lib/auth/constants";
import { logger } from "@/lib/logger";
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

  const hasFollowsResult = await userHasFollows(supabase, userId);
  if (!hasFollowsResult.ok) {
    logger.warn({
      operation: "auth.resolvePostAuthPath.userHasFollows",
      message: "Failed to resolve post-auth follow state. Falling back to discover.",
      userId,
      errorCode: hasFollowsResult.error.code,
      error: hasFollowsResult.error.message,
    });
    return DISCOVER_PATH;
  }

  if (hasFollowsResult.data) {
    return VILLAGE_PATH;
  }

  return DISCOVER_PATH;
}
