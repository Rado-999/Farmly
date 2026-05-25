import type { SupabaseClient } from "@supabase/supabase-js";

import { becomeFarmer } from "@/lib/auth/become-farmer";
import { syncFarmerPublicMirrorFromProfile } from "@/lib/farmers/sync-farmer-public-mirror";
import { uploadAvatar } from "@/lib/onboarding/storage";
import type {
  StepIdentityValues,
  StepLocationValues,
  StepPracticeValues,
  StepStoryValues,
} from "@/lib/onboarding/types";

type SaveResult = { ok: true } | { ok: false; message: string };

async function ensureFarmerProfile(
  supabase: SupabaseClient,
): Promise<{ ok: true; farmerProfileId: string } | { ok: false; message: string }> {
  const result = await becomeFarmer(supabase);

  if (result.status === "error") {
    return { ok: false, message: result.message };
  }

  return { ok: true, farmerProfileId: result.farmerProfileId };
}

export async function saveIdentityStep(
  supabase: SupabaseClient,
  userId: string,
  values: StepIdentityValues,
): Promise<SaveResult> {
  let avatarUrl: string | undefined;

  if (values.avatarFile) {
    const upload = await uploadAvatar(supabase, userId, values.avatarFile);

    if (upload.error || !upload.url) {
      return { ok: false, message: upload.error ?? "Не успяхме да качим снимката." };
    }

    avatarUrl = upload.url;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: values.name.trim(),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      onboarding_step: 2,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    name: values.name.trim(),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  });

  return { ok: true };
}

export async function saveLocationStep(
  supabase: SupabaseClient,
  userId: string,
  role: "buyer" | "farmer",
  values: StepLocationValues,
): Promise<SaveResult> {
  const city = values.city.trim();
  const region = values.region.trim();
  const nextStep = role === "farmer" ? 3 : 99;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      city,
      region,
      onboarding_step: nextStep,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  if (role === "farmer") {
    const farmer = await ensureFarmerProfile(supabase);

    if (!farmer.ok) {
      return farmer;
    }

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

export async function saveStoryStep(
  supabase: SupabaseClient,
  userId: string,
  values: StepStoryValues,
): Promise<SaveResult> {
  const farmer = await ensureFarmerProfile(supabase);

  if (!farmer.ok) {
    return farmer;
  }

  const { error } = await supabase
    .from("farmer_profiles")
    .update({
      bio: values.bio.trim(),
      story: values.story.trim(),
      philosophy: values.philosophy.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  const { error: stepError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 4, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (stepError) {
    return { ok: false, message: stepError.message };
  }

  return { ok: true };
}

export async function savePracticeStep(
  supabase: SupabaseClient,
  userId: string,
  values: StepPracticeValues,
): Promise<SaveResult> {
  const years = Number.parseInt(values.experienceYears, 10);
  const experienceYears = Number.isNaN(years) ? null : years;

  const { error } = await supabase
    .from("farmer_profiles")
    .update({
      experience_years: experienceYears,
      farming_types: values.farmingTypes,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  const { error: stepError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 5, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (stepError) {
    return { ok: false, message: stepError.message };
  }

  return { ok: true };
}

export async function completeOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<SaveResult> {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_profile_complete: true,
      onboarding_step: 99,
      onboarding_skipped_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    is_profile_complete: true,
  });

  return { ok: true };
}

export async function skipOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<SaveResult> {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_profile_complete: false,
      onboarding_skipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { ok: false, message: error.message };
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    is_profile_complete: false,
  });

  return { ok: true };
}
