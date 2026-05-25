import {
  ALLOWED_VIDEO_MIME_TYPES,
  isAllowedVideoFilename,
  MAX_DURATION_SECONDS,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
} from "@/lib/videos/constants";

type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateVideoFile(file: File): ValidationResult {
  if (!isAllowedVideoFilename(file.name)) {
    return {
      ok: false,
      message:
        "Поддържаме само MP4 за надеждно възпроизвеждане. Експортирайте от QuickTime („Export as Movie“ или MP4) или конвертирайте MOV → MP4.",
    };
  }

  const mime = file.type.trim().toLowerCase();

  /** Desktop/mobile sometimes omits MIME for MP4 picks */
  if (
    mime !== "" &&
    !ALLOWED_VIDEO_MIME_TYPES.includes(
      mime as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      message:
        "Поддържаме само MP4 (видео/аудио в MP4 контейнер). MOV не се възпроизвежда добре във всички браузъри.",
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      message: `Видеото надвишава лимита от ${MAX_FILE_MB} MB.`,
    };
  }

  return { ok: true };
}

export function validateVideoDuration(durationSeconds: number): ValidationResult {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return {
      ok: false,
      message: "Не успяхме да прочетем продължителността на видеото.",
    };
  }

  if (durationSeconds > MAX_DURATION_SECONDS) {
    return {
      ok: false,
      message: "Видеото е по-дълго от 3 минути.",
    };
  }

  return { ok: true };
}

export function validateVideoMetadata(values: {
  title: string;
}): ValidationResult {
  if (!values.title.trim()) {
    return { ok: false, message: "Добавете заглавие на видеото." };
  }

  return { ok: true };
}
