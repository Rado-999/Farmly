import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { ONBOARDING_PATH, PROFILE_PATH } from "@/lib/auth/constants";
import {
  ensureProfileForAuthUser,
  type ExistingProfileSnapshot,
} from "@/lib/auth/ensure-profile";
import { getProfileDisplayName } from "@/lib/auth/profile";
import type { LayoutViewer } from "@/lib/auth/viewer";
import { fetchOnboardingProfile } from "@/lib/onboarding/state";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { getFarmerProductAccess } from "@/lib/products/access";
import type { FarmerProductAccess } from "@/lib/products/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabaseClientOrThrow } from "@/lib/supabase/server";

type ServerAuthContext = {
  supabase: SupabaseClient;
  user: User;
};

type ServerProfileContext = ServerAuthContext & {
  profile: OnboardingProfile;
};

type OptionalServerViewerContext = ServerAuthContext & {
  profile: OnboardingProfile | null;
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

const getRequestServerAuthContext = cache(
  async (): Promise<{ supabase: SupabaseClient; user: User | null }> => {
    const supabase = await createServerSupabaseClientOrThrow();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return {
      supabase,
      user: error ? null : user,
    };
  },
);

const getRequestResolvedProfile = cache(
  async (userId: string): Promise<OnboardingProfile | null> => {
    const { supabase, user } = await getRequestServerAuthContext();

    if (!user || user.id !== userId) {
      return null;
    }

    let profile = await fetchOnboardingProfile(supabase, userId);

    if (!profile) {
      const ensureResult = await ensureProfileForAuthUser(supabase, user, {
        existingProfile: null,
      });

      if (ensureResult.didChangeProfile) {
        profile = await fetchOnboardingProfile(supabase, userId);
      }
    }

    return profile;
  },
);

function toExistingProfileSnapshot(
  profile: OnboardingProfile | null,
): ExistingProfileSnapshot | null {
  if (!profile) {
    return null;
  }

  return {
    email: profile.email,
    name: profile.name,
    role: profile.role,
    farmerProfileId: profile.farmerProfile?.id ?? null,
  };
}

export async function getOptionalServerViewerContext(): Promise<OptionalServerViewerContext | null> {
  if (!getSupabasePublicEnv()) {
    return null;
  }

  const { supabase, user } = await getRequestServerAuthContext();

  if (!user) {
    return null;
  }

  return {
    supabase,
    user,
    profile: await getRequestResolvedProfile(user.id),
  };
}

export async function getLayoutViewer(): Promise<LayoutViewer> {
  const viewerContext = await getOptionalServerViewerContext();

  if (!viewerContext) {
    return { status: "anonymous" };
  }

  const { profile, user } = viewerContext;

  return {
    status: "authenticated",
    displayName: getProfileDisplayName({
      profileName: profile?.name,
      metadataName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      email: profile?.email ?? user.email,
    }),
    avatarUrl: profile?.avatarUrl ?? null,
    farmerPageHref: profile?.farmerProfile?.slug
      ? `/farmers/${profile.farmerProfile.slug}`
      : null,
  };
}

export async function requireServerUser(
  nextPath: string,
): Promise<ServerAuthContext> {
  const { supabase, user } = await getRequestServerAuthContext();

  if (!user) {
    redirectToLogin(nextPath);
  }

  return { supabase, user };
}

export async function requireServerProfile(
  nextPath: string,
): Promise<ServerProfileContext> {
  const { supabase, user } = await requireServerUser(nextPath);
  const cachedProfile = await getRequestResolvedProfile(user.id);
  const ensureResult = await ensureProfileForAuthUser(supabase, user, {
    existingProfile: toExistingProfileSnapshot(cachedProfile),
  });

  const profile = ensureResult.didChangeProfile
    ? await fetchOnboardingProfile(supabase, user.id)
    : cachedProfile;

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
