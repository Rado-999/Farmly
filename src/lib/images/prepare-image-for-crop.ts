/** Profile photos: keep files small and predictable for cropping. */
export const AVATAR_MAX_FILE_BYTES = 8 * 1024 * 1024;
export const AVATAR_MAX_EDGE_PX = 1200;
export const AVATAR_MIN_EDGE_PX = 200;

export type PreparedCropImage = {
  url: string;
  width: number;
  height: number;
  revoke: () => void;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Failed to load image")));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not process image"));
        }
      },
      "image/jpeg",
      0.92,
    );
  });
}

/**
 * Validates and downsizes large uploads so cropping always uses a manageable size.
 */
export async function prepareImageForCrop(
  file: File,
): Promise<PreparedCropImage | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Please choose an image file." };
  }

  if (file.size > AVATAR_MAX_FILE_BYTES) {
    return {
      error: `Image is too large. Please use a file under ${AVATAR_MAX_FILE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const { naturalWidth: width, naturalHeight: height } = image;

    if (
      width < AVATAR_MIN_EDGE_PX ||
      height < AVATAR_MIN_EDGE_PX
    ) {
      URL.revokeObjectURL(objectUrl);
      return {
        error: `Image is too small. Please use at least ${AVATAR_MIN_EDGE_PX}×${AVATAR_MIN_EDGE_PX} pixels.`,
      };
    }

    const maxEdge = Math.max(width, height);

    if (maxEdge <= AVATAR_MAX_EDGE_PX) {
      return {
        url: objectUrl,
        width,
        height,
        revoke: () => URL.revokeObjectURL(objectUrl),
      };
    }

    const scale = AVATAR_MAX_EDGE_PX / maxEdge;
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(objectUrl);
      return { error: "Could not process image." };
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    URL.revokeObjectURL(objectUrl);

    const blob = await canvasToBlob(canvas);
    const resizedUrl = URL.createObjectURL(blob);

    return {
      url: resizedUrl,
      width: targetWidth,
      height: targetHeight,
      revoke: () => URL.revokeObjectURL(resizedUrl),
    };
  } catch {
    URL.revokeObjectURL(objectUrl);
    return { error: "Could not read this image. Try another file." };
  }
}
