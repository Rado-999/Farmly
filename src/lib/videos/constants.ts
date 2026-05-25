/** Supabase Free plan global storage upload cap */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_FILE_MB = 50;

export const MAX_DURATION_SECONDS = 180;

/** Web playback: MP4 (H.264/AAC typical). MOV/QuickTime is unreliable outside Safari. */
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/x-m4v"] as const;

export function isAllowedVideoFilename(name: string): boolean {
  return name.trim().toLowerCase().endsWith(".mp4");
}

export type VideoStageValue = "planting" | "growing" | "harvest" | "daily";

export const VIDEO_STAGE_OPTIONS: { value: VideoStageValue; label: string }[] = [
  { value: "planting", label: "Засаждане" },
  { value: "growing", label: "Растеж" },
  { value: "harvest", label: "Жътва" },
  { value: "daily", label: "Ежедневие" },
];

export const FARMER_VIDEOS_BUCKET = "farmer-videos";
