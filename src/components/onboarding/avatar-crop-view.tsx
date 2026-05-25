"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CropAreaPixels } from "@/lib/images/crop-image";
import {
  clampPan,
  getCoverScale,
  getCropAreaFromPan,
  getInitialPan,
  getPanLimits,
} from "@/lib/images/avatar-crop-math";

type AvatarCropViewProps = {
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  onCropAreaChange: (area: CropAreaPixels) => void;
  onZoomChange?: (zoom: number) => void;
};

export function AvatarCropView({
  imageSrc,
  imageWidth,
  imageHeight,
  onCropAreaChange,
  onZoomChange,
}: AvatarCropViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null,
  );

  const coverScale =
    viewportSize > 0
      ? getCoverScale(viewportSize, imageWidth, imageHeight)
      : 1;
  const limits = getPanLimits(
    viewportSize,
    imageWidth,
    imageHeight,
    coverScale,
    zoom,
  );
  const totalScale = coverScale * zoom;

  const emitCrop = useCallback(() => {
    if (viewportSize <= 0) {
      return;
    }

    onCropAreaChange(
      getCropAreaFromPan(
        imageWidth,
        imageHeight,
        viewportSize,
        coverScale,
        zoom,
        pan,
      ),
    );
  }, [
    coverScale,
    imageHeight,
    imageWidth,
    onCropAreaChange,
    pan,
    viewportSize,
    zoom,
  ]);

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const update = () => {
      const side = Math.floor(element.clientWidth);

      if (side > 0) {
        setViewportSize(side);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (viewportSize <= 0) {
      return;
    }

    const nextLimits = getPanLimits(
      viewportSize,
      imageWidth,
      imageHeight,
      getCoverScale(viewportSize, imageWidth, imageHeight),
      1,
    );
    setZoom(1);
    onZoomChange?.(1);
    setPan(getInitialPan(imageWidth, imageHeight, nextLimits));
  }, [imageSrc, imageWidth, imageHeight, viewportSize, onZoomChange]);

  useEffect(() => {
    emitCrop();
  }, [emitCrop]);

  function handlePointerDown(clientX: number, clientY: number) {
    dragStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
  }

  function handlePointerMove(clientX: number, clientY: number) {
    if (!dragStart.current) {
      return;
    }

    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;

    setPan(
      clampPan(
        {
          x: dragStart.current.panX + deltaX,
          y: dragStart.current.panY + deltaY,
        },
        limits,
      ),
    );
  }

  function handlePointerEnd() {
    dragStart.current = null;
  }

  function handleZoomInput(nextZoom: number) {
    setZoom(nextZoom);
    onZoomChange?.(nextZoom);
    setPan((current) =>
      clampPan(
        current,
        getPanLimits(
          viewportSize,
          imageWidth,
          imageHeight,
          coverScale,
          nextZoom,
        ),
      ),
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white shadow-[0_22px_52px_-28px_rgba(63,90,58,0.22)]">
      <div
        ref={viewportRef}
        className="relative aspect-square w-full touch-none overflow-hidden bg-stone-800"
        onMouseDown={(event) => handlePointerDown(event.clientX, event.clientY)}
        onMouseMove={(event) => {
          if (event.buttons === 1) {
            handlePointerMove(event.clientX, event.clientY);
          }
        }}
        onMouseUp={handlePointerEnd}
        onMouseLeave={handlePointerEnd}
        onTouchStart={(event) => {
          const touch = event.touches[0];

          if (touch) {
            handlePointerDown(touch.clientX, touch.clientY);
          }
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];

          if (touch) {
            event.preventDefault();
            handlePointerMove(touch.clientX, touch.clientY);
          }
        }}
        onTouchEnd={handlePointerEnd}
      >
        {viewportSize > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- crop source
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              width: imageWidth,
              height: imageHeight,
              left: `calc(50% + ${pan.x}px)`,
              top: `calc(50% + ${pan.y}px)`,
              transform: `translate(-50%, -50%) scale(${totalScale})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-stone-700" />
        )}
      </div>

      <div className="border-t border-stone-200/70 px-5 pb-5 pt-4">
        <label className="flex items-center gap-4">
          <span className="w-12 shrink-0 text-sm font-medium text-stone-700">
            Мащаб
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => handleZoomInput(Number(event.target.value))}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-forest"
            aria-label="Мащаб на снимката"
          />
        </label>
      </div>
    </div>
  );
}
