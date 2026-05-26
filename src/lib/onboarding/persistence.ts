import type { SupabaseClient } from "@supabase/supabase-js";

import { err, ok, type Result } from "@/lib/errors/result";
import { becomeFarmer } from "@/lib/auth/become-farmer";
import { syncFarmerPublicMirrorFromProfile } from "@/lib/farmers/sync-farmer-public-mirror";
import { uploadAvatar } from "@/lib/onboarding/storage";
import type {
  StepIdentityValues,
  StepLocationValues,
  StepPracticeValues,
  StepStoryValues,
} from "@/lib/onboarding/types";

type OnboardingPersistenceErrorCode =
  | "onboarding.avatar_upload_failed"
  | "onboarding.profile_update_failed"
  | "onboarding.become_farmer_failed"
  | "onboarding.farmer_update_failed"
  | "onboarding.step_update_failed";

type SaveResult = Result<void, OnboardingPersistenceErrorCode>;
type FarmerProfileResult = Result<
  { farmerProfileId: string },
  "onboarding.become_farmer_failed"
>;

async function ensureFarmerProfile(
  supabase: SupabaseClient,
): Promise<FarmerProfileResult> {
  const result = await becomeFarmer(supabase);

  if (result.status === "error") {
    return err("onboarding.become_farmer_failed", result.message);
  }

  return ok({ farmerProfileId: result.farmerProfileId });
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
      return err(
        "onboarding.avatar_upload_failed",
        upload.error ?? "Не успяхме да качим снимката.",
      );
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
    return err("onboarding.profile_update_failed", error.message);
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    name: values.name.trim(),
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  });

  return ok();
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
    return err("onboarding.profile_update_failed", profileError.message);
  }

  if (role === "farmer") {
    const farmer = await ensureFarmerProfile(supabase);

    if (!farmer.ok) {
      return err(farmer.error.code, farmer.error.message);
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
      return err("onboarding.farmer_update_failed", farmerError.message);
    }
  }

  return ok();
}

export async function saveStoryStep(
  supabase: SupabaseClient,
  userId: string,
  values: StepStoryValues,
): Promise<SaveResult> {
  const farmer = await ensureFarmerProfile(supabase);

  if (!farmer.ok) {
    return err(farmer.error.code, farmer.error.message);
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
    return err("onboarding.farmer_update_failed", error.message);
  }

  const { error: stepError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 4, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (stepError) {
    return err("onboarding.step_update_failed", stepError.message);
  }

  return ok();
}

export async function savePracticeStep(
  supabase: SupabaseClient,
  userId: string,
  values: StepPracticeValues,
): Promise<SaveResult> {
  const farmer = await ensureFarmerProfile(supabase);

  if (!farmer.ok) {
    return err(farmer.error.code, farmer.error.message);
  }

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
    return err("onboarding.farmer_update_failed", error.message);
  }

  const { error: stepError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 5, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (stepError) {
    return err("onboarding.step_update_failed", stepError.message);
  }

  return ok();
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
    return err("onboarding.profile_update_failed", error.message);
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    is_profile_complete: true,
  });

  return ok();
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
    return err("onboarding.profile_update_failed", error.message);
  }

  await syncFarmerPublicMirrorFromProfile(supabase, userId, {
    is_profile_complete: false,
  });

  return ok();
}
