export type VideoMetadata = {
  durationSeconds: number;
  posterBlob: Blob;
};

function waitForEvent(
  target: HTMLVideoElement,
  eventName: keyof HTMLMediaElementEventMap,
): Promise<void> {
  return new Promise((resolve, reject) => {
    function onSuccess() {
      cleanup();
      resolve();
    }

    function onError() {
      cleanup();
      reject(new Error("Не успяхме да обработим видеото."));
    }

    function cleanup() {
      target.removeEventListener(eventName, onSuccess);
      target.removeEventListener("error", onError);
    }

    target.addEventListener(eventName, onSuccess, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function capturePosterFrame(video: HTMLVideoElement): Blob {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  if (!context || canvas.width === 0 || canvas.height === 0) {
    throw new Error("Не успяхме да създадем миниатюра.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: "image/jpeg" });
}

async function seekAndGrabPoster(
  video: HTMLVideoElement,
  durationSeconds: number,
): Promise<Blob> {
  const anchors = [
    Math.min(Math.max(durationSeconds * 0.08, 0.12), Math.min(durationSeconds, 2)),
    Math.min(0.05, durationSeconds * 0.5),
    0,
  ];

  let lastError: Error | undefined;

  for (const anchor of anchors) {
    video.currentTime = anchor;

    try {
      await waitForEvent(video, "seeked");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        return capturePosterFrame(video);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  throw lastError ?? new Error("Не успяхме да създадем миниатюра.");
}

export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await waitForEvent(video, "loadedmetadata");

    const durationSeconds = video.duration;

    try {
      await waitForEvent(video, "loadeddata");
    } catch {
      /** Some codecs fire metadata only — continue with seek fallback */
    }

    const posterBlob = await seekAndGrabPoster(video, durationSeconds);

    return { durationSeconds, posterBlob };
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute("src");
    video.load();
  }
}
