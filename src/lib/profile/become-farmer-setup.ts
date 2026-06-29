import type { SupabaseClient } from "@supabase/supabase-js";

import { becomeFarmer } from "@/lib/auth/become-farmer";
import { err, ok, type Result } from "@/lib/errors/result";
import { uploadFarmerCover } from "@/lib/farmers/storage";
import { syncFarmerPublicMirrorFromProfile } from "@/lib/farmers/sync-farmer-public-mirror";
import { uploadAvatar } from "@/lib/onboarding/storage";

export type BecomeFarmerSetupValues = {
  avatarFile: File | null;
  bio: string;
  story: string;
  philosophy: string;
  coverFile: File | null;
};

type BecomeFarmerSetupContext = {
  existingAvatarUrl: string | null;
  existingCity: string | null;
  existingRegion: string | null;
};

export async function completeBecomeFarmerSetup(
  supabase: SupabaseClient,
  userId: string,
  values: BecomeFarmerSetupValues,
  context: BecomeFarmerSetupContext,
): Promise<Result<void, string>> {
  const bio = values.bio.trim();
  const story = values.story.trim();
  const philosophy = values.philosophy.trim();

  if (!bio || !story || !philosophy) {
    return err(
      "become_farmer_setup.story_required",
      "Please fill in your farm introduction, story, and philosophy.",
    );
  }

  if (!values.avatarFile && !context.existingAvatarUrl) {
    return err(
      "become_farmer_setup.avatar_required",
      "Please add a profile photo.",
    );
  }

  const created = await becomeFarmer(supabase);

  if (created.status === "error") {
    return err("become_farmer_setup.failed", created.message);
  }

  let avatarUrl: string | undefined;

  if (values.avatarFile) {
    const upload = await uploadAvatar(supabase, userId, values.avatarFile);

    if (upload.error || !upload.url) {
      return err(
        "become_farmer_setup.avatar_upload_failed",
        upload.error ?? "Could not upload photo.",
      );
    }

    avatarUrl = upload.url;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      return err("become_farmer_setup.profile_update_failed", profileError.message);
    }

    await syncFarmerPublicMirrorFromProfile(supabase, userId, {
      avatar_url: avatarUrl,
    });
  }

  let coverImageUrl: string | undefined;

  if (values.coverFile) {
    const upload = await uploadFarmerCover(
      supabase,
      created.farmerProfileId,
      values.coverFile,
    );

    if (upload.error || !upload.url) {
      return err(
        "become_farmer_setup.cover_upload_failed",
        upload.error ?? "Could not upload cover photo.",
      );
    }

    coverImageUrl = upload.url;
  }

  const { error: farmerError } = await supabase
    .from("farmer_profiles")
    .update({
      bio,
      story,
      philosophy,
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId);

  if (farmerError) {
    return err("become_farmer_setup.farmer_update_failed", farmerError.message);
  }

  const hasLocation = Boolean(
    context.existingCity?.trim() && context.existingRegion?.trim(),
  );
  const nextStep = hasLocation ? 4 : 2;

  const { error: stepError } = await supabase
    .from("profiles")
    .update({
      onboarding_step: nextStep,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (stepError) {
    return err("become_farmer_setup.step_update_failed", stepError.message);
  }

  return ok();
}
