import type { SupabaseClient } from "@supabase/supabase-js";

import { becomeFarmer } from "@/lib/auth/become-farmer";
import { uploadFarmerCover } from "@/lib/farmers/storage";
import { syncFarmerPublicMirrorFromProfile } from "@/lib/farmers/sync-farmer-public-mirror";
import { uploadAvatar } from "@/lib/onboarding/storage";

type SaveResult = { ok: true } | { ok: false; message: string };

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
    return { ok: false, message: "Please enter your name." };
  }

  let avatarUrl: string | undefined;

  if (values.avatarFile) {
    const upload = await uploadAvatar(supabase, userId, values.avatarFile);

    if (upload.error || !upload.url) {
      return { ok: false, message: upload.error ?? "Could not upload photo." };
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
    return { ok: false, message: error.message };
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    name,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  });

  const { data: farmer } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

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
      return { ok: false, message: farmerError.message };
    }
  }

  return { ok: true };
}

export async function updateFarmerDetails(
  supabase: SupabaseClient,
  userId: string,
  values: UpdateFarmerDetailsValues,
): Promise<SaveResult> {
  let { data: existing } = await supabase
    .from("farmer_profiles")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!existing) {
    const created = await becomeFarmer(supabase);

    if (created.status === "error") {
      return { ok: false, message: created.message };
    }

    const { data: createdRow } = await supabase
      .from("farmer_profiles")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    existing = createdRow;
  }

  let coverImageUrl: string | undefined;

  if (values.coverFile && existing?.id) {
    const upload = await uploadFarmerCover(
      supabase,
      existing.id,
      values.coverFile,
    );

    if (upload.error || !upload.url) {
      return {
        ok: false,
        message: upload.error ?? "Could not upload cover photo.",
      };
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
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
