import type { CropAreaPixels } from "@/lib/images/crop-image";

export function getCoverScale(
  viewportSize: number,
  imageWidth: number,
  imageHeight: number,
): number {
  return Math.max(viewportSize / imageWidth, viewportSize / imageHeight);
}

export function getPanLimits(
  viewportSize: number,
  imageWidth: number,
  imageHeight: number,
  coverScale: number,
  zoom: number,
) {
  const scale = coverScale * zoom;
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  return {
    maxX: Math.max(0, (displayWidth - viewportSize) / 2),
    maxY: Math.max(0, (displayHeight - viewportSize) / 2),
  };
}

export function clampPan(
  pan: { x: number; y: number },
  limits: { maxX: number; maxY: number },
) {
  return {
    x: Math.min(limits.maxX, Math.max(-limits.maxX, pan.x)),
    y: Math.min(limits.maxY, Math.max(-limits.maxY, pan.y)),
  };
}

export function getInitialPan(
  imageWidth: number,
  imageHeight: number,
  limits: { maxX: number; maxY: number },
) {
  const isPortrait = imageHeight > imageWidth;

  return {
    x: 0,
    y: isPortrait && limits.maxY > 0 ? -limits.maxY * 0.5 : 0,
  };
}

/** Maps the square viewport to source pixels for export. */
export function getCropAreaFromPan(
  imageWidth: number,
  imageHeight: number,
  viewportSize: number,
  coverScale: number,
  zoom: number,
  pan: { x: number; y: number },
): CropAreaPixels {
  const scale = coverScale * zoom;
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  const left = (viewportSize - displayWidth) / 2 + pan.x;
  const top = (viewportSize - displayHeight) / 2 + pan.y;

  let x = Math.max(0, -left / scale);
  let y = Math.max(0, -top / scale);
  const side = viewportSize / scale;

  if (x + side > imageWidth) {
    x = Math.max(0, imageWidth - side);
  }

  if (y + side > imageHeight) {
    y = Math.max(0, imageHeight - side);
  }

  const width = Math.min(side, imageWidth - x);
  const height = Math.min(side, imageHeight - y);
  const cropSide = Math.min(width, height);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropSide),
    height: Math.round(cropSide),
  };
}
