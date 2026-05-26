import {
  ALLOWED_VIDEO_MIME_TYPES,
  isAllowedVideoFilename,
  MAX_DURATION_SECONDS,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
} from "@/lib/videos/constants";
import { err, ok, type Result } from "@/lib/errors/result";

export type VideoValidationErrorCode =
  | "video.file_format_invalid"
  | "video.file_mime_invalid"
  | "video.file_too_large"
  | "video.duration_invalid"
  | "video.duration_too_long"
  | "video.title_required";

export type VideoValidationResult = Result<void, VideoValidationErrorCode>;

export function validateVideoFile(file: File): VideoValidationResult {
  if (!isAllowedVideoFilename(file.name)) {
    return err(
      "video.file_format_invalid",
      "Поддържаме само MP4 за надеждно възпроизвеждане. Експортирайте от QuickTime („Export as Movie“ или MP4) или конвертирайте MOV → MP4.",
    );
  }

  const mime = file.type.trim().toLowerCase();

  /** Desktop/mobile sometimes omits MIME for MP4 picks */
  if (
    mime !== "" &&
    !ALLOWED_VIDEO_MIME_TYPES.includes(
      mime as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return err(
      "video.file_mime_invalid",
      "Поддържаме само MP4 (видео/аудио в MP4 контейнер). MOV не се възпроизвежда добре във всички браузъри.",
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return err(
      "video.file_too_large",
      `Видеото надвишава лимита от ${MAX_FILE_MB} MB.`,
    );
  }

  return ok();
}

export function validateVideoDuration(
  durationSeconds: number,
): VideoValidationResult {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return err(
      "video.duration_invalid",
      "Не успяхме да прочетем продължителността на видеото.",
    );
  }

  if (durationSeconds > MAX_DURATION_SECONDS) {
    return err("video.duration_too_long", "Видеото е по-дълго от 3 минути.");
  }

  return ok();
}

export function validateVideoMetadata(values: {
  title: string;
}): VideoValidationResult {
  if (!values.title.trim()) {
    return err("video.title_required", "Добавете заглавие на видеото.");
  }

  return ok();
}
