import type { SupabaseClient } from "@supabase/supabase-js";

import { err, ok, type Result } from "@/lib/errors/result";
import { deleteFarmerVideoFiles } from "@/lib/videos/storage";
import type { VideoRow } from "@/lib/supabase/database.types";

type DeleteVideoErrorCode =
  | "video.files_delete_failed"
  | "video.row_delete_failed"
  | "conflict"
  | "consistency_error";

export type DeleteVideoResult = Result<void, DeleteVideoErrorCode>;

async function loadVideoSnapshot(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<{ video: VideoRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, farmer_id, product_id, title, description, type, video_url, poster_url, duration_seconds, created_at",
    )
    .eq("id", videoId)
    .eq("farmer_id", farmerProfileId)
    .maybeSingle();

  if (error) {
    return { video: null, error: error.message };
  }

  return { video: (data as VideoRow | null) ?? null, error: null };
}

async function removeVideoRow(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
  createdAt: string | null | undefined,
): Promise<{ error: string | null }> {
  const query = supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("farmer_id", farmerProfileId);

  const { data, error } =
    createdAt == null
      ? await query.is("created_at", null).select("id")
      : await query.eq("created_at", createdAt).select("id");

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: "conflict" };
  }

  return { error: null };
}

async function restoreVideoRow(
  supabase: SupabaseClient,
  snapshot: VideoRow,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("videos").insert({
    id: snapshot.id,
    farmer_id: snapshot.farmer_id,
    product_id: snapshot.product_id,
    title: snapshot.title,
    description: snapshot.description,
    type: snapshot.type,
    video_url: snapshot.video_url,
    poster_url: snapshot.poster_url ?? null,
    duration_seconds: snapshot.duration_seconds ?? null,
    ...(snapshot.created_at ? { created_at: snapshot.created_at } : {}),
  });

  return { error: error?.message ?? null };
}

async function verifyVideoDeletion(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<{ consistent: boolean; error: string | null }> {
  const [{ data: row, error: rowError }, { data: objects, error: listError }] =
    await Promise.all([
      supabase
        .from("videos")
        .select("id")
        .eq("id", videoId)
        .eq("farmer_id", farmerProfileId)
        .maybeSingle(),
      supabase.storage.from("farmer-videos").list(`${farmerProfileId}/${videoId}`),
    ]);

  if (rowError) {
    return { consistent: false, error: rowError.message };
  }

  if (listError) {
    return { consistent: false, error: listError.message };
  }

  return {
    consistent: !row && (!objects || objects.length === 0),
    error: null,
  };
}

export async function executeDeleteFarmerVideoMutation(
  supabase: SupabaseClient,
  farmerProfileId: string,
  videoId: string,
): Promise<DeleteVideoResult> {
  const snapshotResult = await loadVideoSnapshot(supabase, farmerProfileId, videoId);

  if (snapshotResult.error) {
    return err("video.row_delete_failed", snapshotResult.error);
  }

  if (snapshotResult.video) {
    const rowResult = await removeVideoRow(
      supabase,
      farmerProfileId,
      videoId,
      snapshotResult.video.created_at,
    );

    if (rowResult.error) {
      let rowAlreadyRemoved = false;

      if (rowResult.error === "conflict") {
        const latest = await loadVideoSnapshot(supabase, farmerProfileId, videoId);

        if (latest.error) {
          return err("video.row_delete_failed", latest.error);
        }

        if (latest.video) {
          return err(
            "conflict",
            "Видеото беше променено в друга сесия. Обновете и опитайте отново.",
          );
        }

        rowAlreadyRemoved = true;
      }

      if (!rowAlreadyRemoved) {
        return err("video.row_delete_failed", rowResult.error);
      }
    }
  }

  const storageResult = await deleteFarmerVideoFiles(
    supabase,
    farmerProfileId,
    videoId,
  );

  if (storageResult.error) {
    if (snapshotResult.video) {
      const restore = await restoreVideoRow(supabase, snapshotResult.video);

      if (restore.error) {
        return err("consistency_error", storageResult.error);
      }
    }

    return err("video.files_delete_failed", storageResult.error);
  }

  const verification = await verifyVideoDeletion(
    supabase,
    farmerProfileId,
    videoId,
  );

  if (verification.error || !verification.consistent) {
    return err("consistency_error", "Неуспешно изтриване.");
  }

  return ok();
}
