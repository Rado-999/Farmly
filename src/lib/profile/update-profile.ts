import type { SupabaseClient } from "@supabase/supabase-js";

import { err, ok, type Result } from "@/lib/errors/result";
import { becomeFarmer } from "@/lib/auth/become-farmer";
import { uploadFarmerCover } from "@/lib/farmers/storage";
import { syncFarmerPublicMirrorFromProfile } from "@/lib/farmers/sync-farmer-public-mirror";
import { uploadAvatar } from "@/lib/onboarding/storage";

type UpdateProfileErrorCode =
  | "profile.name_required"
  | "profile.avatar_upload_failed"
  | "profile.profile_update_failed"
  | "profile.farmer_lookup_failed"
  | "profile.farmer_update_failed"
  | "profile.become_farmer_failed"
  | "profile.cover_upload_failed";

type SaveResult = Result<void, UpdateProfileErrorCode>;

export type UpdateAccountValues = {
  name: string;
  avatarFile: File | null;
  city: string;
  region: string;
};

export type UpdateFarmerDetailsValues = {
  bio: string;
  story: string;
  philosophy: string;
  coverFile: File | null;
};

export async function updateAccountProfile(
  supabase: SupabaseClient,
  userId: string,
  values: UpdateAccountValues,
): Promise<SaveResult> {
  const name = values.name.trim();
  const city = values.city.trim();
  const region = values.region.trim();

  if (!name) {
    return err("profile.name_required", "Please enter your name.");
  }

  let avatarUrl: string | undefined;

  if (values.avatarFile) {
    const upload = await uploadAvatar(supabase, userId, values.avatarFile);

    if (upload.error || !upload.url) {
      return err(
        "profile.avatar_upload_failed",
        upload.error ?? "Could not upload photo.",
      );
    }

    avatarUrl = upload.url;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name,
      city,
      region,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return err("profile.profile_update_failed", error.message);
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    name,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  });

  const { data: farmer, error: farmerLookupError } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (farmerLookupError) {
    return err("profile.farmer_lookup_failed", farmerLookupError.message);
  }

  if (farmer) {
    const { error: farmerError } = await supabase
      .from("farmer_profiles")
      .update({
        location: city,
        region,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", userId);

    if (farmerError) {
      return err("profile.farmer_update_failed", farmerError.message);
    }
  }

  return ok();
}

export async function updateFarmerDetails(
  supabase: SupabaseClient,
  userId: string,
  values: UpdateFarmerDetailsValues,
): Promise<SaveResult> {
  const { data: existing, error: existingError } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingError) {
    return err("profile.farmer_lookup_failed", existingError.message);
  }

  let farmerProfileId = existing?.id ?? null;

  if (!farmerProfileId) {
    const created = await becomeFarmer(supabase);

    if (created.status === "error") {
      return err("profile.become_farmer_failed", created.message);
    }

    farmerProfileId = created.farmerProfileId;
  }

  let coverImageUrl: string | undefined;

  if (values.coverFile && farmerProfileId) {
    const upload = await uploadFarmerCover(
      supabase,
      farmerProfileId,
      values.coverFile,
    );

    if (upload.error || !upload.url) {
      return err(
        "profile.cover_upload_failed",
        upload.error ?? "Could not upload cover photo.",
      );
    }

    coverImageUrl = upload.url;
  }

  const { error } = await supabase
    .from("farmer_profiles")
    .update({
      bio: values.bio.trim(),
      story: values.story.trim(),
      philosophy: values.philosophy.trim(),
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId);

  if (error) {
    return err("profile.farmer_update_failed", error.message);
  }

  return ok();
}
